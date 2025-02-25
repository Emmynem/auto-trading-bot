import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { Telegraf } from "telegraf";
import { fetchTradingPairs, findGraduatingCoins } from "./controllers/TradingPair";
import sequelize from "./config/database";
import { trading, chatID, escapeMarkdownV2 } from "./config/config";
import { Trade } from "./models/Trade";
import { TradingPair } from "./models/TradingPair";

dotenv.config();

const NODE_ENV: string = process.env.NODE_ENV || "development";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

const bot = new Telegraf(TELEGRAM_BOT_TOKEN || "");
sequelize.sync().then(() => console.log("✅ Database synced"));

// ---------------------- Trading Logic ----------------------
async function tradeGraduatingCoins() {
	try {
		const graduatingCoins = await findGraduatingCoins();
		for (const coin of graduatingCoins) {
			console.log(`🚀 Buying ${coin.symbol}...`);
			await executeTrade("buy", coin.symbol, trading.tradeAmount, coin.tokenAddress, coin.tokenName, coin.pairCreated, coin.trendScore);
			await Trade.create({ symbol: coin.symbol, action: "buy", amount: trading.tradeAmount });
		}
	} catch (error) {
		console.error("❌ Trading error:", error);
	}
}

async function executeTrade(action: "buy" | "sell", symbol: string, amount: number, tokenAddress: string, tokenName: string, pairCreated: string, score: number) {
	const tradeMessage = `/${action} ${symbol} ${amount}`;

	const message = `🔔 *${action.toUpperCase()}* *Trade Alert:*\n\n`
		+ `🪙 *Name:* ${escapeMarkdownV2(tokenName || '')} \\| ${symbol}\n`
		+ `💬 *CA:* \`${tokenAddress}\`\n`
		+ `💯 *Score:* ${score}/100\n`
		+ `📅 *Created:* ${escapeMarkdownV2(pairCreated.toString())}\n`;

	await bot.telegram.sendMessage(TELEGRAM_CHAT_ID || chatID, message, { parse_mode: "MarkdownV2" });
	console.log(`✅ Trade executed: ${tradeMessage}`);
}

// ---------------------- Job Scheduler ----------------------

cron.schedule(`*/${trading.botTimer} * * * *`, async () => {
	await TradingPair.truncate();
	await Trade.truncate();
	console.log("⏳ Running trading job...");
	await fetchTradingPairs();
	await tradeGraduatingCoins();
	console.log("✅ Completed trading job...");
});

// ---------------------- Health Check API ----------------------
const app = express();
const PORT: number = process.env.PORT ? (NODE_ENV === "development" ? parseInt('851') : parseInt('3051')) : (NODE_ENV === "development" ? parseInt('851') : parseInt('3051'));

app.get("/health", (_req, res) => {
	res.json({ status: "running" });
});

app.listen(PORT, () => {
	console.log(`🚀 Health Check API for Trading Bot running on port ${PORT}`);
});

// ---------------------- Bot Launch ----------------------
bot.telegram.getMe().then((botInfo) => {
	console.log(`🤖 Bot ${botInfo.username} is running...`);
}).catch((err) => {
	console.error("❌ Bot connection error:", err);
});

bot.launch().then(() => console.log("🤖 Bot started!"));

process.once("SIGINT", () => { bot.stop("SIGINT"); process.exit(1); });
process.once("SIGTERM", () => { bot.stop("SIGTERM"); process.exit(1); });

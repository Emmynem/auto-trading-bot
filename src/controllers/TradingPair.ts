import axios from "axios";
import moment from "moment";
import { TradingPair } from "../models/TradingPair";
import { calculateTrendScore, hypeKeywords, searchWords, timestamp_str_alt, trading } from "../config/config";

export async function fetchTradingPairs() {
	try {
		const indexNow = Math.floor(Math.random() * hypeKeywords.length);

		const response = await axios.get(`https://api.dexscreener.com/latest/dex/search?q=${hypeKeywords[indexNow].toLowerCase() + "%20" + searchWords}`);
		const pairs = response.data.pairs.filter((pair: any) => pair.chainId === "solana" && pair.dexId === "raydium");
		
		const formattedPairs = pairs.map((p: any) => ({
			symbol: p.baseToken ? p.baseToken.symbol : "",
			dexId: p.dexId,
			tokenName: p.baseToken ? p.baseToken.name : "",
			tokenAddress: p.baseToken ? p.baseToken.address : "",
			price: parseFloat(p.priceUsd),
			liquidity: p.liquidity ? p.liquidity.usd : null,
			volume_h24: p.volume ? p.volume.h24 : null,
			volume_h6: p.volume ? p.volume.h6 : null,
			volume_h1: p.volume ? p.volume.h1 : null,
			volume_m5: p.volume ? p.volume.m5 : null,
			marketCap: p.marketCap || null,
			trendScore: p.baseToken && p.liquidity && p.volume && p.marketCap ? calculateTrendScore(p) : 0,
			pairCreated: timestamp_str_alt(p.pairCreatedAt),
		}));

		await TradingPair.bulkCreate(formattedPairs, { ignoreDuplicates: true, updateOnDuplicate: ["symbol", "tokenAddress"] });

		console.log("✅ Trading pairs updated.");
	} catch (error) {
		console.error("❌ Error fetching trading pairs:", error);
	}
};

export async function findGraduatingCoins() {
	try {
		const pairs = await TradingPair.findAll();

		// const highPotential = pairs.filter((coin) => {
		// 	// Ensure values exist to prevent errors
		// 	const liquidity = coin.liquidity || 0;
		// 	const volume24h = coin.volume_h24 || 0;
		// 	const volume6h = coin.volume_h6 || 0;
		// 	const volume1h = coin.volume_h1 || 0;
		// 	const volume5m = coin.volume_m5 || 0;
		// 	const marketCap = coin.marketCap || 0;
		// 	const pairCreated = coin.pairCreated || ""; // Ensure it's a string
		// 	const trendScore = coin.trendScore || 0;

		// 	// 🕒 Ensure it's a **recent** token (less than 48h old)
		// 	const maxAgeInHours = 48;

		// 	// Convert the `pairCreated` string (YYYY-MM-DD HH:mm:ss) to a Date object
		// 	const pairCreatedDate = moment(pairCreated, "YYYY-MM-DD HH:mm:ss").toDate();

		// 	// Calculate token age in hours
		// 	const tokenAge = (Date.now() - pairCreatedDate.getTime()) / (1000 * 60 * 60);
		// 	const isNewToken = tokenAge < maxAgeInHours; // Only allow tokens less than 48h old

		// 	// 💰 Growing liquidity (Prevent dead coins)
		// 	const isGrowingLiquidity = liquidity >= 100000; // Now needs at least $100K to be safer

		// 	// 📊 Strong trading volume (Buy pressure)
		// 	const isGrowingVolume =
		// 		volume24h >= 500000 || // 24h volume must be at least $500K
		// 		volume6h >= 300000 ||  // OR 6h volume at least $300K
		// 		volume1h >= 150000 ||  // OR 1h volume at least $150K
		// 		volume5m >= 50000;     // OR 5m volume at least $50K (high activity)

		// 	// 🚀 Small-cap gems (Room for massive growth)
		// 	const isSmallCap = marketCap > 0 && marketCap < 5000000; // Market cap < $5M

		// 	// 🔥 Trend Score Check (Only keep **high potential** coins)
		// 	const meetsTrendScore = trendScore >= trading.tradingScore; // (config = 70)

		// 	return isNewToken && isGrowingLiquidity && isGrowingVolume && isSmallCap && meetsTrendScore;
		// });

		// // 🏆 Sort by highest trend score
		// return highPotential.sort((a, b) => b.trendScore - a.trendScore);

		const highPotential = pairs.filter((coin) => {
			const marketCap = coin.marketCap || 0;
			const pairCreated = coin.pairCreated || ""; // Ensure it's a string
			const trendScore = coin.trendScore || 0;

			// 🕒 Ensure it's a **recent** token (less than 48h old)
			const maxAgeInHours = 48;

			// Convert the `pairCreated` string (YYYY-MM-DD HH:mm:ss) to a Date object
			const pairCreatedDate = moment(pairCreated, "YYYY-MM-DD HH:mm:ss").toDate();

			// Calculate token age in hours
			const tokenAge = (Date.now() - pairCreatedDate.getTime()) / (1000 * 60 * 60);
			const isNewToken = tokenAge < maxAgeInHours; // Only allow tokens less than 48h old

			// 🚀 Small-cap gems (Room for massive growth)
			const isSmallCap = marketCap > 0 && marketCap < 5000000; // Market cap < $5M

			// 🔥 Trend Score Check (Only keep **high potential** coins)
			const meetsTrendScore = trendScore >= trading.tradingScore; // (config = 70)

			return isNewToken && isSmallCap && meetsTrendScore;
		});

		// 🏆 Sort by highest trend score
		return highPotential.sort((a, b) => b.trendScore - a.trendScore);

	} catch (error) {
		console.error("❌ Error finding high-potential coins:", error);
		return [];
	}
};

export const trading = {
	enabled: true,
	tradeAmount: 0.1,
	tradingScore: 75,
	botTimer: 60 // In mins 5, 20, 10
};

export const timestamp_str_alt = (date: string | number) => {
	const d = new Date(date);
	const date_ = d.getFullYear() + "-" + ((d.getUTCMonth() + 1) < 10 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());
	const time_ = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()) + ":" + (d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds());
	return date_ + " " + time_;
};

export const hypeKeywords = ["AI", "Tiktok", "Meme", "Bonk", "Shiba", "Doge", "Community", "100x", "Moon", "Pump"];
export const searchWords = hypeKeywords.toString().toLowerCase().replace(",", "%20");

export function calculateTrendScore(pair: any): number {
	let score = 0;
	const now = Date.now(); // Get current timestamp in milliseconds

	// Default values to avoid undefined errors
	const liquidity = pair.liquidity?.usd || 0;
	const volume24h = pair.volume?.h24 || 0;
	const marketCap = pair.marketCap || 0;

	// 🕵️‍♂️ 1. Newly Created Pairs (Brand new tokens have high potential)
	if (pair.pairCreatedAt) {
		const ageInHours = (now - pair.pairCreatedAt) / (1000 * 60 * 60); // Convert ms to hours
		if (ageInHours < 6) score += 30; // Fresh launch = Highest potential
		else if (ageInHours < 12) score += 20;
		else if (ageInHours < 24) score += 10;
	}

	// 💰 2. Liquidity Score (Too little = unsafe, too much = slow growth)
	if (liquidity >= 500000) score += 15;
	else if (liquidity >= 200000) score += 10;
	else if (liquidity >= 50000) score += 5;
	else score -= 10; // Very low liquidity = risky

	// 📈 3. Volume Score (Strong trading activity = real interest)
	if (volume24h >= 1000000) score += 25;
	else if (volume24h >= 500000) score += 20;
	else if (volume24h >= 100000) score += 10;

	// 🚀 4. Market Cap Score (Low market caps have more room to grow)
	if (marketCap < 3000000) score += 20; // Extreme low cap = 🚀🚀
	else if (marketCap < 10000000) score += 10;
	else score += 5;

	// ⚠️ 5. Sell vs Buy Pressure (Avoid dump-heavy tokens)
	const buyTxns = (pair.txns?.m5?.buys || 0) + (pair.txns?.h1?.buys || 0) + (pair.txns?.h6?.buys || 0) + (pair.txns?.h24?.buys || 0);
	const sellTxns = (pair.txns?.m5?.sells || 0) + (pair.txns?.h1?.sells || 0) + (pair.txns?.h6?.sells || 0) + (pair.txns?.h24?.sells || 0);

	if (sellTxns > buyTxns * 2) score -= 20; // More sells than buys = avoid 🚩
	else if (sellTxns > buyTxns) score -= 10; // Slightly more sells = risky
	else if (buyTxns > sellTxns * 2) score += 20; // Strong buy pressure = good signal

	// 📊 6. Price Change Momentum (Analyzing trends)
	const priceChanges = [
		pair.priceChange?.m5 || 0,
		pair.priceChange?.h1 || 0,
		pair.priceChange?.h6 || 0,
		pair.priceChange?.h24 || 0
	];
	const avgPriceChange = priceChanges.reduce((sum, val) => sum + val, 0) / priceChanges.length;

	if (avgPriceChange > 50) score += 25; // Bullish spike 🚀
	else if (avgPriceChange > 20) score += 15;
	else if (avgPriceChange > 10) score += 10;
	else if (avgPriceChange < -20) score -= 20; // Extreme dump = avoid 🚩

	// 🚀 7. Hype Keywords (Trending narratives like AI, Meme, etc.)
	const hypeKeywords = ["AI", "Tiktok", "Meme", "Bonk", "Shiba", "Doge", "Community", "100x", "Moon", "Pump"];
	const tokenName = pair.baseToken.name.toLowerCase();

	if (hypeKeywords.some((word) => tokenName.includes(word.toLowerCase()))) {
		score += 15; // High hype = More potential 🚀
	}

	// Normalize score between 0-100
	return Math.min(Math.max(score, 0), 100);
};

export const chatID = 588749749;

// Escape MarkdownV2 Text Automatically
export function escapeMarkdownV2(text: string): string {
	return text.replace(/[_[\]()~`>#+\-=|{}.!]/g, "\\$&");
	// return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&"); // Main one
	// return text.replace(/[.]+/g, "\\$&");
}
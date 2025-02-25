import { Sequelize } from "sequelize-typescript";
import { TradingPair } from "../models/TradingPair";
import { Trade } from "../models/Trade";
import dotenv from "dotenv";

dotenv.config();

const {
	DATABASE,
	DATABASE_ONLINE,
	DB_HOST,
	DB_HOST_ONLINE,
	DB_USER,
	DB_USER_ONLINE,
	DB_PASSWORD,
	DB_PASSWORD_ONLINE,
	NODE_ENV
} = process.env;

const sequelize = new Sequelize({
	database: NODE_ENV === "development" ? DATABASE : DATABASE_ONLINE,
	username: NODE_ENV === "development" ? DB_USER : DB_USER_ONLINE,
	password: NODE_ENV === "development" ? DB_PASSWORD : DB_PASSWORD_ONLINE,
	host: NODE_ENV === "development" ? DB_HOST : DB_HOST_ONLINE,
	dialect: "mysql",
	models: [TradingPair, Trade],
	logging: false, // Enable if you want to see SQL queries
});

export default sequelize;

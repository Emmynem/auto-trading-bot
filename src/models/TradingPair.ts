import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "trading_pair", timestamps: true })
export class TradingPair extends Model {
	@Column({ type: DataType.STRING, allowNull: false, unique: true })
	symbol!: string;
	
	@Column({ type: DataType.STRING, allowNull: false })
	dexId!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	tokenName!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	tokenAddress!: string;

	@Column({ type: DataType.FLOAT, allowNull: true })
	price!: number;

	@Column({ type: DataType.FLOAT, allowNull: true })
	liquidity!: number;

	@Column({ type: DataType.FLOAT, allowNull: true })
	volume_h24!: number;

	@Column({ type: DataType.FLOAT, allowNull: true })
	volume_h6!: number;

	@Column({ type: DataType.FLOAT, allowNull: true })
	volume_h1!: number;

	@Column({ type: DataType.FLOAT, allowNull: true })
	volume_m5!: number;

	@Column({ type: DataType.FLOAT, allowNull: true })
	marketCap!: number;

	@Column({ type: DataType.FLOAT, allowNull: true })
	trendScore!: number;

	@Column({ type: DataType.DATE, allowNull: true })
	pairCreated!: string;
}
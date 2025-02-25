import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "trade", timestamps: true })
export class Trade extends Model {
	@Column({ type: DataType.STRING, allowNull: false })
	symbol!: string;

	@Column({ type: DataType.ENUM("buy", "sell"), allowNull: false })
	action!: string;

	@Column({ type: DataType.FLOAT, allowNull: false })
	amount!: number;
}

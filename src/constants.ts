import "dotenv/config";

let databaseName: string =
	process.env.MONGOLOQUENT_DATABASE_NAME || "mongoloquent";

if (process.env.NODE_ENV === "test") {
	databaseName =
		process.env.MONGOLOQUENT_DATABASE_NAME || databaseName + "_test";
}

export const MONGOLOQUENT_DATABASE_NAME: string = databaseName;
export const MONGOLOQUENT_DATABASE_URI: string =
	process.env.MONGOLOQUENT_DATABASE_URI || "mongodb://localhost:27017";
export const TIMEZONE: string =
	process.env.MONGOLOQUENT_TIMEZONE || "Asia/Jakarta";

export const OPERATORS = [
	{
		operator: "=",
		mongoOperator: "eq",
	},
	{
		operator: "!=",
		mongoOperator: "ne",
	},
	{
		operator: ">",
		mongoOperator: "gt",
	},
	{
		operator: "<",
		mongoOperator: "lt",
	},
	{
		operator: ">=",
		mongoOperator: "gte",
	},
	{
		operator: "<=",
		mongoOperator: "lte",
	},
	{
		operator: "in",
		mongoOperator: "in",
	},
	{
		operator: "notIn",
		mongoOperator: "nin",
	},
	{
		operator: "like",
		mongoOperator: "regex",
		options: "i",
	},
];

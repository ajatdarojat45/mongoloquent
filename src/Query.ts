import { Document, ObjectId } from "mongodb";
import { IOrder, IWhere } from "./interfaces/IQuery";
import Database from "./Database";

export default class Query extends Database {
	/**
	 * The current stages to be run.
	 *
	 * @var {mongodb/Document[]}
	 */
	protected static $stages: Document[] = [];

	/**
	 * The columns that should be returned.
	 *
	 * @var {string[]}
	 */
	protected static $columns: string[] = [];

	/**
	 * The columns that should be excluded.
	 *
	 * @var {string[]}
	 */
	private static $excludes: string[] = [];

	/**
	 * The where constraints for the query.
	 *
	 * @var {IWhere[]}
	 */
	private static $wheres: IWhere[] = [];

	/**
	 * The orderings for the query.
	 *
	 * @var {IOrder[]}
	 */
	private static $orders: IOrder[] = [];

	/**
	 * The groupings for the query.
	 *
	 * @var {string[]}
	 */
	private static $groups: string[] = [];

	/**
	 * Identifier for soft delete feature.
	 *
	 * @var {boolean}
	 */
	public static $useSoftDelete: boolean = false;

	/**
	 * Identifier for querying soft deleted data.
	 *
	 * @var {boolean}
	 */
	private static $withTrashed: boolean = false;

	/**
	 * Identifier for querying only soft deleted data.
	 *
	 * @var {boolean}
	 */
	private static $onlyTrashed: boolean = false;

	/**
	 * The maximum number of records to return.
	 *
	 * @var {number}
	 */
	private static $limit: number = 15;

	/**
	 * The number of records to skip.
	 *
	 * @var {number}
	 */
	private static $offset: number = 0;

	/**
	 * All of the available clause operators.
	 *
	 * @var {Array<{operator: string, mongoOperator: string, options?: string}>}
	 */
	private static $operators = [
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

	/**
	 * Set the columns to be selected.
	 *
	 * @param  {string|string[]} columns - The columns to be selected.
	 * @return {this} The current query instance.
	 */
	public static select<T extends typeof Query>(
		this: T,
		columns: string | string[]
	): T {
		if (Array.isArray(columns)) this.$columns.push(...columns);
		else this.$columns.push(columns);

		return this;
	}

	/**
	 * Set the columns to be excluded.
	 *
	 * @param  {string|string[]} columns - The columns to be excluded.
	 * @return {this} The current query instance.
	 */
	public static exclude<T extends typeof Query>(
		this: T,
		columns: string | string[]
	): T {
		if (Array.isArray(columns)) this.$excludes.push(...columns);
		else this.$excludes.push(columns);

		return this;
	}

	/**
	 * Add a basic where clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {any} operator - The operator to use.
	 * @param  {any} [value=null] - The value to compare against.
	 * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
	 * @return {this} The current query instance.
	 */
	public static where<T extends typeof Query>(
		this: T,
		column: string,
		operator: any,
		value: any = null,
		boolean: string = "and"
	): T {
		let _value = value || operator;
		let _operator = value ? operator : "eq";

		this.$wheres.push({ column, operator: _operator, value: _value, boolean });

		return this;
	}

	/**
	 * Add an "or where" clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {any} [operator=null] - The operator to use.
	 * @param  {any} [value=null] - The value to compare against.
	 * @return {this} The current query instance.
	 */
	public static orWhere<T extends typeof Query>(
		this: T,
		column: string,
		operator: string | null = null,
		value: any = null
	): T {
		return this.where(column, operator, value, "or");
	}

	/**
	 * Add a basic "where not" clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {any} value - The value to compare against.
	 * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
	 * @return {this} The current query instance.
	 */
	public static whereNot<T extends typeof Query>(
		this: T,
		column: string,
		value: any,
		boolean: string = "and"
	): T {
		return this.where(column, "ne", value, boolean);
	}

	/**
	 * Add an "or where not" clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {any} value - The value to compare against.
	 * @return {this} The current query instance.
	 */
	public static orWhereNot<T extends typeof Query>(
		this: T,
		column: string,
		value: any
	): T {
		return this.whereNot(column, value, "or");
	}

	/**
	 * Add a "where in" clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {[any, ...any[]]} values - The values to compare against.
	 * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
	 * @param  {boolean} [not=false] - Whether to negate the clause.
	 * @return {this} The current query instance.
	 */
	public static whereIn<T extends typeof Query>(
		this: T,
		column: string,
		values: [any, ...any[]],
		boolean: string = "and",
		not: boolean = false
	): T {
		const type = not ? "nin" : "in";
		this.$wheres.push({ column, operator: type, value: values, boolean });

		return this;
	}

	/**
	 * Add an "or where in" clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {[any, ...any[]]} values - The values to compare against.
	 * @return {this} The current query instance.
	 */
	public static orWhereIn<T extends typeof Query>(
		this: T,
		column: string,
		values: [any, ...any[]]
	): T {
		return this.whereIn(column, values, "or");
	}

	/**
	 * Add a "where not in" clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {[any, ...any[]]} values - The values to compare against.
	 * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
	 * @return {this} The current query instance.
	 */
	public static whereNotIn<T extends typeof Query>(
		this: T,
		column: string,
		values: [any, ...any[]],
		boolean: string = "and"
	): T {
		return this.whereIn(column, values, boolean, true);
	}

	/**
	 * Add an "or where not in" clause to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {[any, ...any[]]} values - The values to compare against.
	 * @return {this} The current query instance.
	 */
	public static orWhereNotIn<T extends typeof Query>(
		this: T,
		column: string,
		values: [any, ...any[]]
	): T {
		return this.whereNotIn(column, values, "or");
	}

	/**
	 * Add a where between statement to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {[any, any]} values - The range of values to compare against.
	 * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
	 * @param  {boolean} [not=false] - Whether to negate the clause.
	 * @return {this} The current query instance.
	 */
	public static whereBetween<T extends typeof Query>(
		this: T,
		column: string,
		values: [any, any],
		boolean: string = "and",
		not: boolean = false
	): T {
		this.$wheres.push({
			column,
			operator: "between",
			value: values,
			boolean,
		});

		return this;
	}

	/**
	 * Add an or where between statement to the query.
	 *
	 * @param  {string} column - The column to apply the where clause on.
	 * @param  {[any, any]} values - The range of values to compare against.
	 * @return {this} The current query instance.
	 */
	public static orWhereBetween<T extends typeof Query>(
		this: T,
		column: string,
		values: [any, any]
	): T {
		return this.whereBetween(column, values, "or");
	}

	/**
	 * Add a "where null" clause to the query.
	 *
	 * @param  {string} column - The column to check for null.
	 * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
	 * @return {this} The current query instance.
	 */
	public static whereNull<T extends typeof Query>(
		this: T,
		column: string,
		boolean: string = "and"
	): T {
		return this.where(column, "eq", null, boolean);
	}

	/**
	 * Set query with trashed data.
	 *
	 * @return {this} The current query instance.
	 */
	public static withTrashed<T extends typeof Query>(this: T): T {
		this.$withTrashed = true;

		return this;
	}

	/**
	 * Set query only trashed data.
	 *
	 * @return {this} The current query instance.
	 */
	public static onlyTrashed<T extends typeof Query>(this: T): T {
		this.$onlyTrashed = true;
		return this.where("isDeleted", "eq", true);
	}

	/**
	 * Set the "offset" value of the query.
	 *
	 * @param  {number} value - The number of records to skip.
	 * @return {this} The current query instance.
	 */
	public static offset<T extends typeof Query>(this: T, value: number): T {
		this.$stages.push({ $skip: value });

		return this;
	}

	/**
	 * Alias to set the "offset" value of the query.
	 *
	 * @param  {number} value - The number of records to skip.
	 * @return {this} The current query instance.
	 */
	public static skip<T extends typeof Query>(this: T, value: number): T {
		return this.offset(value);
	}

	/**
	 * Set the "limit" value of the query.
	 *
	 * @param  {number} value - The maximum number of records to return.
	 * @return {this} The current query instance.
	 */
	public static limit<T extends typeof Query>(this: T, value: number): T {
		this.$stages.push({ $limit: value });

		return this;
	}

	/**
	 * Alias to set the "limit" value of the query.
	 *
	 * @param  {number} value - The maximum number of records to return.
	 * @return {this} The current query instance.
	 */
	public static take<T extends typeof Query>(this: T, value: number): T {
		return this.limit(value);
	}

	/**
	 * Set the limit and offset for a given page.
	 *
	 * @param  {number} page - The page number.
	 * @param  {number} [perPage=15] - The number of records per page.
	 * @return {this} The current query instance.
	 */
	public static forPage<T extends typeof Query>(
		this: T,
		page: number,
		perPage: number = 15
	): T {
		return this.offset((page - 1) * perPage).limit(perPage);
	}

	/**
	 * Add order by for a query.
	 *
	 * @param  {string} column - The column to order by.
	 * @param  {string} [order="asc"] - The order direction (asc/desc).
	 * @param  {boolean} [isSensitive=false] - Whether the order is case-sensitive.
	 * @return {this} The current query instance.
	 */
	static orderBy<T extends typeof Query>(
		this: T,
		column: string,
		order: string = "asc",
		isSensitive: boolean = false
	): T {
		this.$orders.push({ column, order, isSensitive });

		return this;
	}

	/**
	 * Add group by for a query.
	 *
	 * @param  {string} column - The column to group by.
	 * @return {this} The current query instance.
	 */
	static groupBy<T extends typeof Query>(this: T, column: string): T {
		this.$groups.push(column);

		return this;
	}

	/**
	 * Check soft delete feature.
	 *
	 * @return {void}
	 */
	public static checkSoftDelete(): void {
		if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
			this.where("isDeleted", false);
	}

	/**
	 * Generate selected columns for a query.
	 *
	 * @return {void}
	 */
	public static generateColumns(): void {
		let $project = {};
		this.$columns.forEach((el) => {
			$project = { ...$project, [el]: 1 };
		});

		if (Object.keys($project).length > 0) this.$stages.push({ $project });
	}

	/**
	 * Generate excluded columns for a query.
	 *
	 * @return {void}
	 */
	public static generateExcludes(): void {
		let $project = {};
		this.$excludes.forEach((el) => {
			$project = { ...$project, [el]: 0 };
		});

		if (Object.keys($project).length > 0) this.$stages.push({ $project });
	}

	/**
	 * Generate conditions for a query.
	 *
	 * @return {void}
	 */
	public static generateWheres(): void {
		let $and: Document[] = [];
		let $or: Document[] = [];

		this.$wheres.forEach((el) => {
			const op = this.$operators.find(
				(op) => op.operator === el.operator || op.mongoOperator === el.operator
			);

			let value;
			if (el.column === "_id") {
				if (Array.isArray(el.value))
					value = el.value.map((val) => new ObjectId(val));
				else value = new ObjectId(el.value);
			}

			let condition = {
				[el.column]: {
					[`$${op?.mongoOperator}`]: value || el.value,
				},
				$options: op?.options,
			};

			if (el.operator === "between")
				condition = {
					[el.column]: {
						$gte: el.value?.[0],
						$lte: el.value?.[el.value.length - 1],
					},
					$options: op?.options,
				};

			if (!condition.$options) delete condition.$options;

			if (el.boolean === "and") $and.push(condition);
			else $or.push(condition);
		});

		if ($or.length > 0) {
			if ($and.length > 0) $or.push({ $and });

			this.$stages.push({ $match: { $or } });
			return;
		}

		if ($and.length > 0) this.$stages.push({ $match: { $and } });
	}

	/**
	 * Generate orders for a query.
	 *
	 * @return {void}
	 */
	static generateOrders(): void {
		let $project = {
			document: "$$ROOT",
		};

		let $sort = {};

		this.$orders.forEach((el) => {
			$project = { ...$project, [el.column]: 1 };
			const direction = el.order === "asc" ? 1 : -1;

			if (el.isSensitive) {
				$project = {
					...$project,
					[`lowercase_${el.column}`]: { $toLower: `$${el.column}` },
				};
				$sort = {
					...$sort,
					[`lowercase_${el.column}`]: direction,
				};
			} else $sort = { ...$sort, [el.column]: direction };
		});

		const orders = [
			{ $project },
			{ $sort },
			{
				$replaceRoot: {
					newRoot: "$document",
				},
			},
		];

		if (this.$orders.length > 0) this.$stages.push(...orders);
	}

	/**
	 * Generate groups for a query.
	 *
	 * @return {void}
	 */
	static generateGroups(): void {
		let _id = {};

		this.$groups.forEach((el) => {
			_id = { ..._id, [el]: `$${el}` };
		});

		const $group = {
			_id,
			count: { $sum: 1 },
		};

		if (this.$groups.length > 0) this.$stages.push({ $group });
	}

	/**
	 * Reset query state.
	 *
	 * @return {void}
	 */
	protected static resetQuery(): void {
		this.$withTrashed = false;
		this.$onlyTrashed = false;
		this.$stages = [];
		this.$excludes = [];
		this.$wheres = [];
		this.$orders = [];
		this.$groups = [];
	}
}

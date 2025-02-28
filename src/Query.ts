import { Document, ObjectId } from "mongodb";
import { IOrder, IWhere } from "./interfaces/IQuery";
import Database from "./Database";

export default class Query extends Database {
  /**
   * @note This property stores the current stages to be run.
   * @var {mongodb/Document[]}
   */
  protected static $stages: Document[] = [];

  /**
   * @note This property stores the columns that should be returned.
   * @var {string[]}
   */
  protected static $columns: string[] = [];

  /**
   * @note This property stores the columns that should be excluded.
   * @var {string[]}
   */
  private static $excludes: string[] = [];

  /**
   * @note This property stores the where constraints for the query.
   * @var {IWhere[]}
   */
  private static $wheres: IWhere[] = [];

  /**
   * @note This property stores the orderings for the query.
   * @var {IOrder[]}
   */
  private static $orders: IOrder[] = [];

  /**
   * @note This property stores the groupings for the query.
   * @var {string[]}
   */
  private static $groups: string[] = [];

  /**
   * @note This property identifies if the soft delete feature is enabled.
   * @var {boolean}
   */
  public static $useSoftDelete: boolean = false;

  public static $IS_DELETED: string = "IS_DELETED";
  public static $DELETED_AT: string = "DELETED_AT";

  /**
   * @note This property identifies if querying soft deleted data is enabled.
   * @var {boolean}
   */
  private static $withTrashed: boolean = false;

  /**
   * @note This property identifies if querying only soft deleted data is enabled.
   * @var {boolean}
   */
  private static $onlyTrashed: boolean = false;

  /**
   * @note This property stores the maximum number of records to return.
   * @var {number}
   */
  protected static $limit: number = 15;

  /**
   * @note This property stores the number of records to skip.
   * @var {number}
   */
  private static $offset: number = 0;

  /**
   * @note This property stores all of the available clause operators.
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
   * @note This method sets the columns to be selected.
   * @param  {string|string[]} columns - The columns to be selected.
   * @return {this} The current query instance.
   */
  public static select<T extends typeof Query>(
    this: T,
    columns: string | string[]
  ): T {
    // Check if columns is an array
    if (Array.isArray(columns))
      // Add each column to the $columns array
      this.$columns.push(...columns);
    // Add the single column to the $columns array
    else this.$columns.push(columns);

    return this;
  }

  /**
   * @note This method sets the columns to be excluded.
   * @param  {string|string[]} columns - The columns to be excluded.
   * @return {this} The current query instance.
   */
  public static exclude<T extends typeof Query>(
    this: T,
    columns: string | string[]
  ): T {
    // Check if columns is an array
    if (Array.isArray(columns))
      // Add each column to the $excludes array
      this.$excludes.push(...columns);
    // Add the single column to the $excludes array
    else this.$excludes.push(columns);

    return this;
  }

  /**
   * @note This method adds a basic where clause to the query.
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
    // Determine the value and operator
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    // Add the where clause to the $wheres array
    this.$wheres.push({ column, operator: _operator, value: _value, boolean });

    return this;
  }

  /**
   * @note This method adds an "or where" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any} [operator=null] - The operator to use.
   * @param  {any} [value=null] - The value to compare against.
   * @return {this} The current query instance.
   */
  public static orWhere<T extends typeof Query>(
    this: T,
    column: string,
    operator: any,
    value: any = null
  ): T {
    // Determine the value and operator
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    // Call the where method with "or" boolean
    return this.where(column, _operator, _value, "or");
  }

  /**
   * @note This method adds a basic "where not" clause to the query.
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
    // Call the where method with "ne" operator
    return this.where(column, "ne", value, boolean);
  }

  /**
   * @note This method adds an "or where not" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any} value - The value to compare against.
   * @return {this} The current query instance.
   */
  public static orWhereNot<T extends typeof Query>(
    this: T,
    column: string,
    value: any
  ): T {
    // Call the whereNot method with "or" boolean
    return this.whereNot(column, value, "or");
  }

  /**
   * @note This method adds a "where in" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {[any, ...any[]]} values - The values to compare against.
   * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
   * @param  {boolean} [not=false] - Whether to negate the clause.
   * @return {this} The current query instance.
   */
  public static whereIn<T extends typeof Query>(
    this: T,
    column: string,
    values: any[],
    boolean: string = "and",
    not: boolean = false
  ): T {
    // Determine the operator type
    const type = not ? "nin" : "in";
    // Add the whereIn clause to the $wheres array
    this.$wheres.push({ column, operator: type, value: values, boolean });

    return this;
  }

  /**
   * @note This method adds an "or where in" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {[any, ...any[]]} values - The values to compare against.
   * @return {this} The current query instance.
   */
  public static orWhereIn<T extends typeof Query>(
    this: T,
    column: string,
    values: [any, ...any[]]
  ): T {
    // Call the whereIn method with "or" boolean
    return this.whereIn(column, values, "or");
  }

  /**
   * @note This method adds a "where not in" clause to the query.
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
    // Call the whereIn method with "nin" operator
    return this.whereIn(column, values, boolean, true);
  }

  /**
   * @note This method adds an "or where not in" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {[any, ...any[]]} values - The values to compare against.
   * @return {this} The current query instance.
   */
  public static orWhereNotIn<T extends typeof Query>(
    this: T,
    column: string,
    values: [any, ...any[]]
  ): T {
    // Call the whereNotIn method with "or" boolean
    return this.whereNotIn(column, values, "or");
  }

  /**
   * @note This method adds a where between statement to the query.
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
    // Add the whereBetween clause to the $wheres array
    this.$wheres.push({
      column,
      operator: "between",
      value: values,
      boolean,
    });

    return this;
  }

  /**
   * @note This method adds an or where between statement to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {[any, any]} values - The range of values to compare against.
   * @return {this} The current query instance.
   */
  public static orWhereBetween<T extends typeof Query>(
    this: T,
    column: string,
    values: [any, any]
  ): T {
    // Call the whereBetween method with "or" boolean
    return this.whereBetween(column, values, "or");
  }

  /**
   * @note This method adds a "where null" clause to the query.
   * @param  {string} column - The column to check for null.
   * @param  {string} [boolean="and"] - The boolean operator to use (and/or).
   * @return {this} The current query instance.
   */
  public static whereNull<T extends typeof Query>(
    this: T,
    column: string,
    boolean: string = "and"
  ): T {
    // Call the where method with "eq" operator and null value
    return this.where(column, "eq", null, boolean);
  }

  /**
   * @note This method sets the query to include trashed data.
   * @return {this} The current query instance.
   */
  public static withTrashed<T extends typeof Query>(this: T): T {
    // Set the $withTrashed property to true
    this.$withTrashed = true;

    return this;
  }

  /**
   * @note This method sets the query to include only trashed data.
   * @return {this} The current query instance.
   */
  public static onlyTrashed<T extends typeof Query>(this: T): T {
    // Set the $onlyTrashed property to true
    this.$onlyTrashed = true;
    // Add a where clause to filter only trashed data
    return this.where(this.$IS_DELETED, "eq", true);
  }

  /**
   * @note This method sets the "offset" value of the query.
   * @param  {number} value - The number of records to skip.
   * @return {this} The current query instance.
   */
  public static offset<T extends typeof Query>(this: T, value: number): T {
    // Add the $skip stage to the $stages array
    this.$stages.push({ $skip: value });

    return this;
  }

  /**
   * @note This method is an alias to set the "offset" value of the query.
   * @param  {number} value - The number of records to skip.
   * @return {this} The current query instance.
   */
  public static skip<T extends typeof Query>(this: T, value: number): T {
    // Call the offset method
    return this.offset(value);
  }

  /**
   * @note This method sets the "limit" value of the query.
   * @param  {number} value - The maximum number of records to return.
   * @return {this} The current query instance.
   */
  public static limit<T extends typeof Query>(this: T, value: number): T {
    // Add the $limit stage to the $stages array
    this.$stages.push({ $limit: value });

    return this;
  }

  /**
   * @note This method is an alias to set the "limit" value of the query.
   * @param  {number} value - The maximum number of records to return.
   * @return {this} The current query instance.
   */
  public static take<T extends typeof Query>(this: T, value: number): T {
    // Call the limit method
    return this.limit(value);
  }

  /**
   * @note This method sets the limit and offset for a given page.
   * @param  {number} page - The page number.
   * @param  {number} [perPage=15] - The number of records per page.
   * @return {this} The current query instance.
   */
  public static forPage<T extends typeof Query>(
    this: T,
    page: number,
    perPage: number = 15
  ): T {
    // Set the offset and limit for the given page
    return this.offset((page - 1) * perPage).limit(perPage);
  }

  /**
   * @note This method adds an order by clause to the query.
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
    // Add the order by clause to the $orders array
    this.$orders.push({ column, order, isSensitive });

    return this;
  }

  /**
   * @note This method adds a group by clause to the query.
   * @param  {string} column - The column to group by.
   * @return {this} The current query instance.
   */
  static groupBy<T extends typeof Query>(this: T, column: string): T {
    // Add the group by clause to the $groups array
    this.$groups.push(column);

    return this;
  }

  /**
   * @note This method checks if the soft delete feature is enabled and applies the necessary conditions.
   * @return {void}
   */
  public static checkSoftDelete(): void {
    // Check if soft delete is enabled and apply the necessary conditions
    if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
      this.where(this.$IS_DELETED, false);
  }

  /**
   * @note This method generates the selected columns for a query.
   * @return {void}
   */
  public static generateColumns(): void {
    let $project = {};
    // Add each selected column to the $project stage
    this.$columns.forEach((el) => {
      $project = { ...$project, [el]: 1 };
    });

    // Add the $project stage to the $stages array if there are selected columns
    if (Object.keys($project).length > 0) this.$stages.push({ $project });
  }

  /**
   * @note This method generates the excluded columns for a query.
   * @return {void}
   */
  public static generateExcludes(): void {
    let $project = {};
    // Add each excluded column to the $project stage
    this.$excludes.forEach((el) => {
      $project = { ...$project, [el]: 0 };
    });

    // Add the $project stage to the $stages array if there are excluded columns
    if (Object.keys($project).length > 0) this.$stages.push({ $project });
  }

  /**
   * @note This method generates the conditions for a query.
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
   * @note This method generates the orders for a query.
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
   * @note This method generates the groups for a query.
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
   * @note This method resets the query state.
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

import { Document, ObjectId } from "mongodb";
import { IQueryOrder, IQueryWhere } from "./interfaces/IQuery";
import Database from "./Database";

export default class Query extends Database {
  /**
   * @note This property stores the parentId of the document
   * @var {null|ObjectId}
   */
  private static $parentId: null | ObjectId;

  /**
   * @note This property stores the current stages to be run.
   * @var {mongodb/Document[]}
   */
  private static $stages: Document[] = [];

  /**
   * @note This property stores the columns that should be returned.
   * @var {string[]}
   */
  private static $columns: string[] = [];

  /**
   * @note This property stores the columns that should be excluded.
   * @var {string[]}
   */
  private static $excludes: string[] = [];

  /**
   * @note This property stores the where constraints for the query.
   * @var {IQueryWhere[]}
   */
  private static $wheres: IQueryWhere[] = [];

  /**
   * @note This property stores the orderings for the query.
   * @var {IQueryOrder[]}
   */
  private static $orders: IQueryOrder[] = [];

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

  /**
   * @note This property stores the field name for the soft delete flag.
   * @var {string}
   */
  protected static $isDeleted: string = "IS_DELETED";

  /**
   * @note This property stores the field name for the soft delete timestamp.
   * @var {string}
   */
  protected static $deletedAt: string = "DELETED_AT";

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
  protected static $limit: number = 0;

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
    this.setColumns(columns);
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
    this.setExcludes(columns);
    return this;
  }

  /**
   * @note This method adds a basic where clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any} operator - The operator to use.
   * @param  {any} [value=null] - The value to compare against.
   * @return {this} The current query instance.
   */
  public static where<T extends typeof Query>(
    this: T,
    column: string,
    operator: any,
    value: any = null
  ): T {
    // Determine the value and operator
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    // Add the where clause to the $wheres array
    this.setWheres(column, _operator, _value, "and");

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

    // Add the where clause to the $wheres array
    this.setWheres(column, _operator, _value, "or");

    return this;
  }

  /**
   * @note This method adds a basic "where not" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any} value - The value to compare against.
   * @return {this} The current query instance.
   */
  public static whereNot<T extends typeof Query>(
    this: T,
    column: string,
    value: any
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", value, "and");

    return this;
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
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", value, "or");

    return this;
  }

  /**
   * @note This method adds a "where in" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any[]} values - The values to compare against.
   * @return {this} The current query instance.
   */
  public static whereIn<T extends typeof Query>(
    this: T,
    column: string,
    values: any[]
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "in", values, "and");

    return this;
  }

  /**
   * @note This method adds an "or where in" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any[]} values - The values to compare against.
   * @return {this} The current query instance.
   */
  public static orWhereIn<T extends typeof Query>(
    this: T,
    column: string,
    values: any[]
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "in", values, "or");

    return this;
  }

  /**
   * @note This method adds a "where not in" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any[]} values - The values to compare against.
   * @return {this} The current query instance.
   */
  public static whereNotIn<T extends typeof Query>(
    this: T,
    column: string,
    values: any[]
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "nin", values, "and");

    return this;
  }

  /**
   * @note This method adds an "or where not in" clause to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {any[]} values - The values to compare against.
   * @return {this} The current query instance.
   */
  public static orWhereNotIn<T extends typeof Query>(
    this: T,
    column: string,
    values: any[]
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "nin", values, "or");

    return this;
  }

  /**
   * @note This method adds a where between statement to the query.
   * @param  {string} column - The column to apply the where clause on.
   * @param  {[any, any]} values - The range of values to compare against.
   * @return {this} The current query instance.
   */
  public static whereBetween<T extends typeof Query>(
    this: T,
    column: string,
    values: [number, number?]
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "between", values, "and");

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
    values: [number, number?]
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "between", values, "or");

    return this;
  }

  /**
   * @note This method adds a "where null" clause to the query.
   * @param  {string} column - The column to check for null.
   * @return {this} The current query instance.
   */
  public static whereNull<T extends typeof Query>(this: T, column: string): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "eq", null, "and");

    return this;
  }

  /**
   * @note This method adds a "or where null" clause to the query.
   * @param  {string} column - The column to check for null.
   * @return {this} The current query instance.
   */
  public static OrWhereNull<T extends typeof Query>(
    this: T,
    column: string
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "eq", null, "or");

    return this;
  }

  /**
   * @note This method adds a "where not null" clause to the query.
   * @param  {string} column - The column to check for null.
   * @return {this} The current query instance.
   */
  public static whereNotNull<T extends typeof Query>(
    this: T,
    column: string
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", null, "and");

    return this;
  }

  /**
   * @note This method adds a "or where not null" clause to the query.
   * @param  {string} column - The column to check for null.
   * @return {this} The current query instance.
   */
  public static orWhereNotNull<T extends typeof Query>(
    this: T,
    column: string
  ): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", null, "or");

    return this;
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
    return this;
  }

  /**
   * @note This method sets the "offset" value of the query.
   * @param  {number} value - The number of records to skip.
   * @return {this} The current query instance.
   */
  public static offset<T extends typeof Query>(this: T, value: number): T {
    // Add the $skip stage to the $stages array
    this.$offset = value;

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
    this.$limit = value;

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
    this.setOrders({ column, order, isSensitive });

    return this;
  }

  /**
   * @note This method adds a group by clause to the query.
   * @param  {string} column - The column to group by.
   * @return {this} The current query instance.
   */
  static groupBy<T extends typeof Query>(this: T, column: string): T {
    // Add the group by clause to the $groups array
    this.setGroups(column);

    return this;
  }

  /**
   * @note This method sets the parent ID for the query.
   * @param {ObjectId | null} id - The parent ID.
   * @return {void}
   */
  protected static setParentId(id: ObjectId | null): void {
    this.$parentId = id;
  }

  /**
   * @note This method retrieves the parent ID for the query.
   * @return {ObjectId | null} The parent ID.
   */
  protected static getParentId(): ObjectId | null {
    return this.$parentId;
  }

  /**
   * @note This method sets the stages for the query.
   * @param {Document | Document[]} doc - The stages to be set.
   * @return {void}
   */
  private static setStages(doc: Document | Document[]): void {
    if (Array.isArray(doc)) this.$stages = [...this.$stages, ...doc];
    else this.$stages = [...this.$stages, doc];
  }

  /**
   * @note This method retrieves the stages for the query.
   * @return {Document[]} The stages.
   */
  protected static getStages(): Document[] {
    return this.$stages;
  }

  /**
   * @note This method retrieves the field name for the soft delete flag.
   * @return {string} The field name for the soft delete flag.
   */
  public static getIsDeleted(): string {
    return this.$isDeleted;
  }

  /**
   * @note This method sets the columns to be selected.
   * @param {string | string[]} columns - The columns to be selected.
   * @return {void}
   */
  protected static setColumns(columns: string | string[]): void {
    if (Array.isArray(columns)) this.$columns = [...this.$columns, ...columns];
    else this.$columns = [...this.$columns, columns];
  }

  /**
   * @note This method sets the columns to be excluded.
   * @param {string | string[]} columns - The columns to be excluded.
   * @return {void}
   */
  private static setExcludes(columns: string | string[]): void {
    if (Array.isArray(columns))
      this.$excludes = [...this.$excludes, ...columns];
    else this.$excludes = [...this.$excludes, columns];
  }

  /**
   * @note This method adds a basic where clause to the query.
   * @param {string} column - The column to apply the where clause on.
   * @param {any} operator - The operator to use.
   * @param {any} [value=null] - The value to compare against.
   * @param {string} [boolean="and"] - The boolean operator to use (and/or).
   * @return {void}
   */
  private static setWheres(
    column: string,
    operator: any,
    value: any,
    boolean: string = "and"
  ): void {
    // Determine type of query E|R|S
    const ep = ["eq", "ne", "=", "!="];
    let type = "R";
    if (ep.includes(operator)) type = "E";

    // Add the where clause to the $wheres array
    this.$wheres = [
      ...this.$wheres,
      { column, operator: operator, value, boolean, type },
    ];
  }

  /**
   * @note This method sets the orders for the query.
   * @param {IQueryOrder} doc - The orders to be set.
   * @return {void}
   */
  private static setOrders(doc: IQueryOrder): void {
    if (Array.isArray(doc)) this.$orders = [...this.$orders, ...doc];
    else this.$orders = [...this.$orders, doc];
  }

  /**
   * @note This method sets the groups for the query.
   * @param {string} doc - The groups to be set.
   * @return {void}
   */
  private static setGroups(doc: string): void {
    if (Array.isArray(doc)) this.$groups = [...this.$groups, ...doc];
    else this.$groups = [...this.$groups, doc];
  }

  /**
   * @note This method checks if the soft delete feature is enabled and applies the necessary conditions.
   * @return {void}
   */
  public static checkSoftDelete(): void {
    // Check if soft delete is enabled and apply the necessary conditions
    if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
      this.where(this.$isDeleted, false);
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

    // sort by type(E/R/S) for better peformace query in MongoDB
    this.$wheres.sort().forEach((el) => {
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
      let queries = {
        $or,
      };

      if (this.$useSoftDelete && !this.$withTrashed) {
        queries = {
          [this.$isDeleted]: false,
          $or,
        };
      }

      if (this.$useSoftDelete && this.$onlyTrashed) {
        queries = {
          [this.$isDeleted]: true,
          $or,
        };
      }

      this.setStages({ $match: queries });
      return;
    }

    if ($and.length > 0) {
      let queries = {
        $and,
      };

      if (this.$onlyTrashed) {
        queries = {
          [this.$isDeleted]: true,
          $and,
        };
      }
      this.setStages({ $match: queries });
      return;
    }

    if (this.$onlyTrashed) {
      this.setStages({ $match: { [this.$isDeleted]: true } });
    }
  }

  /**
   * @note This method generates the orders for a query.
   * @return {void}
   */
  protected static generateOrders(): void {
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

    if (this.$orders.length > 0) this.setStages(orders);
  }

  /**
   * @note This method generates the groups for a query.
   * @return {void}
   */
  protected static generateGroups(): void {
    let _id = {};

    this.$groups.forEach((el) => {
      _id = { ..._id, [el]: `$${el}` };
    });

    const $group = {
      _id,
      count: { $sum: 1 },
    };

    if (this.$groups.length > 0) this.setStages({ $group });
  }

  /**
   * @note This method generates the limit for a query.
   * @return {void}
   */
  protected static generateLimit(): void {
    if (this.$limit > 0) this.setStages({ $limit: this.$limit });
  }

  /**
   * @note This method generates the offset for a query.
   * @return {void}
   */
  protected static generateOffset(): void {
    if (this.$offset > 0) this.setStages({ $skip: this.$offset });
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
    this.$parentId = null;
    this.$offset = 0;
    this.$limit = 0;
  }
}

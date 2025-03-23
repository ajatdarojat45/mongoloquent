import { Document, ObjectId } from "mongodb";
import { IQueryOrder, IQueryWhere } from "./interfaces/IQuery";
import Database from "./Database";

export default class Query extends Database {
  /**
   * Stores the parentId of the document
   * @private
   * @type {ObjectId | null}
   */
  private static $parentId: ObjectId | null = null;

  /**
   * Stores the ID of the document to be retrieved
   * @private
   * @type {ObjectId | null}
   */
  private static $id: ObjectId | null = null;

  /**
   * Stores the current aggregation pipeline stages
   * @private
   * @type {Document[]}
   */
  private static $stages: Document[] = [];

  /**
   * Stores the columns that should be returned
   * @private
   * @type {string[]}
   */
  private static $columns: string[] = [];

  /**
   * Stores the columns that should be excluded
   * @private
   * @type {string[]}
   */
  private static $excludes: string[] = [];

  /**
   * Stores the where constraints for the query
   * @private
   * @type {IQueryWhere[]}
   */
  private static $wheres: IQueryWhere[] = [];

  /**
   * Stores the orderings for the query
   * @private
   * @type {IQueryOrder[]}
   */
  private static $orders: IQueryOrder[] = [];

  /**
   * Stores the groupings for the query
   * @private
   * @type {string[]}
   */
  private static $groups: string[] = [];

  /**
   * Identifies if the soft delete feature is enabled
   * @public
   * @type {boolean}
   */
  public static $useSoftDelete: boolean = false;

  /**
   * Stores the field name for the soft delete flag
   * @protected
   * @type {string}
   */
  protected static $isDeleted: string = "isDeleted";

  /**
   * Stores the field name for the soft delete timestamp
   * @protected
   * @type {string}
   */
  protected static $deletedAt: string = "deletedAt";

  /**
   * Identifies if querying soft deleted data is enabled
   * @private
   * @type {boolean}
   */
  private static $withTrashed: boolean = false;

  /**
   * Identifies if querying only soft deleted data is enabled
   * @private
   * @type {boolean}
   */
  private static $onlyTrashed: boolean = false;

  /**
   * Stores the maximum number of records to return
   * @protected
   * @type {number}
   */
  protected static $limit: number = 0;

  /**
   * Stores the number of records to skip
   * @private
   * @type {number}
   */
  private static $offset: number = 0;

  /**
   * Stores all of the available clause operators
   * @private
   * @type {Array<{operator: string, mongoOperator: string, options?: string}>}
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
   * Sets columns to be selected in the query
   * @param {string|string[]} columns Columns to be selected
   * @returns {this} Current query instance for chaining
   */
  public static select<
    T extends typeof Query,
    K extends
      | keyof T["$schema"]
      | [keyof T["$schema"], ...(keyof T["$schema"])[]]
      | undefined = undefined
  >(this: T, columns?: K): T {
    this.setColumns(columns as string[]);
    return this;
  }

  /**
   * Sets columns to be excluded from the query results
   * @param {string|string[]} columns Columns to be excluded
   * @returns {this} Current query instance for chaining
   */
  public static exclude<T extends typeof Query>(
    this: T,
    columns: string | string[]
  ): T {
    this.setExcludes(columns);
    return this;
  }

  /**
   * Adds a where clause to filter query results
   * @param {string} column Column name to filter on
   * @param {any} operator Comparison operator or value
   * @param {any} [value] Value to compare against if operator is provided
   * @returns {this} Current query instance for chaining
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
   * Adds an "or where" clause to the query
   * @param {string} column Column name to filter on
   * @param {any} operator Comparison operator or value
   * @param {any} [value] Value to compare against if operator is provided
   * @returns {this} Current query instance for chaining
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
   * Adds a "where not" clause to the query
   * @param {string} column Column name to filter on
   * @param {any} value Value to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds an "or where not" clause to the query
   * @param {string} column Column name to filter on
   * @param {any} value Value to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds a "where in" clause to the query
   * @param {string} column Column name to filter on
   * @param {any[]} values Values to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds an "or where in" clause to the query
   * @param {string} column Column name to filter on
   * @param {any[]} values Values to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds a "where not in" clause to the query
   * @param {string} column Column name to filter on
   * @param {any[]} values Values to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds an "or where not in" clause to the query
   * @param {string} column Column name to filter on
   * @param {any[]} values Values to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds a "where between" clause to the query
   * @param {string} column Column name to filter on
   * @param {[any, any]} values Range of values to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds an "or where between" clause to the query
   * @param {string} column Column name to filter on
   * @param {[any, any]} values Range of values to compare against
   * @returns {this} Current query instance for chaining
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
   * Adds a "where null" clause to the query
   * @param {string} column Column name to check for null
   * @returns {this} Current query instance for chaining
   */
  public static whereNull<T extends typeof Query>(this: T, column: string): T {
    // Add the where clause to the $wheres array
    this.setWheres(column, "eq", null, "and");

    return this;
  }

  /**
   * Adds an "or where null" clause to the query
   * @param {string} column Column name to check for null
   * @returns {this} Current query instance for chaining
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
   * Adds a "where not null" clause to the query
   * @param {string} column Column name to check for not null
   * @returns {this} Current query instance for chaining
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
   * Adds an "or where not null" clause to the query
   * @param {string} column Column name to check for not null
   * @returns {this} Current query instance for chaining
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
   * Sets the query to include trashed data
   * @returns {this} Current query instance for chaining
   */
  public static withTrashed<T extends typeof Query>(this: T): T {
    // Set the $withTrashed property to true
    this.$withTrashed = true;

    return this;
  }

  /**
   * Sets the query to include only trashed data
   * @returns {this} Current query instance for chaining
   */
  public static onlyTrashed<T extends typeof Query>(this: T): T {
    // Set the $onlyTrashed property to true
    this.$onlyTrashed = true;
    return this;
  }

  /**
   * Sets the "offset" value of the query
   * @param {number} value Number of records to skip
   * @returns {this} Current query instance for chaining
   */
  public static offset<T extends typeof Query>(this: T, value: number): T {
    // Add the $skip stage to the $stages array
    this.$offset = value;

    return this;
  }

  /**
   * Alias to set the "offset" value of the query
   * @param {number} value Number of records to skip
   * @returns {this} Current query instance for chaining
   */
  public static skip<T extends typeof Query>(this: T, value: number): T {
    // Call the offset method
    return this.offset(value);
  }

  /**
   * Sets the "limit" value of the query
   * @param {number} value Maximum number of records to return
   * @returns {this} Current query instance for chaining
   */
  public static limit<T extends typeof Query>(this: T, value: number): T {
    // Add the $limit stage to the $stages array
    this.$limit = value;

    return this;
  }

  /**
   * Alias to set the "limit" value of the query
   * @param {number} value Maximum number of records to return
   * @returns {this} Current query instance for chaining
   */
  public static take<T extends typeof Query>(this: T, value: number): T {
    // Call the limit method
    return this.limit(value);
  }

  /**
   * Sets the limit and offset for a given page
   * @param {number} page Page number
   * @param {number} [perPage=15] Number of records per page
   * @returns {this} Current query instance for chaining
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
   * Adds an order by clause to the query
   * @param {string} column Column to order by
   * @param {string} [order="asc"] Order direction (asc/desc)
   * @param {boolean} [isSensitive=false] Whether the order is case-sensitive
   * @returns {this} Current query instance for chaining
   */
  public static orderBy<T extends typeof Query>(
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
   * Adds a group by clause to the query
   * @param {string} column Column to group by
   * @returns {this} Current query instance for chaining
   */
  public static groupBy<T extends typeof Query>(this: T, column: string): T {
    // Add the group by clause to the $groups array
    this.setGroups(column);

    return this;
  }

  /**
   * Sets the parent ID for the query
   * @param {ObjectId | null} id Parent ID
   * @protected
   */
  protected static setParentId(id: ObjectId | null): void {
    this.$parentId = id;
  }

  /**
   * Retrieves the parent ID for the query
   * @returns {ObjectId | null} Parent ID
   * @protected
   */
  protected static getParentId(): ObjectId | null {
    return this.$parentId;
  }

  /**
   * Sets the ID of the document to be retrieved
   * @param {ObjectId | null} id ID to set
   * @protected
   */
  protected static setId(id: ObjectId | null): void {
    this.$id = id;
  }

  /**
   * Retrieves the current document ID
   * @returns {ObjectId | null} Current document ID
   * @protected
   */
  protected static getId(): ObjectId | null {
    return this.$id;
  }

  /**
   * Sets the ID and retrieves the model
   * @param {string | ObjectId} id ID of the item to retrieve
   * @returns {this} Current query instance for chaining
   */
  public static find<T extends typeof Query>(
    this: T,
    id: string | ObjectId
  ): T {
    const _id = new ObjectId(id);
    this.setId(_id);

    return this;
  }

  /**
   * Sets the stages for the query
   * @param {Document | Document[]} doc Stages to be set
   * @private
   */
  private static setStages(doc: Document | Document[]): void {
    if (Array.isArray(doc)) this.$stages = [...this.$stages, ...doc];
    else this.$stages = [...this.$stages, doc];
  }

  /**
   * Retrieves the stages for the query
   * @returns {Document[]} Stages
   * @protected
   */
  protected static getStages(): Document[] {
    return this.$stages;
  }

  /**
   * Gets the field name for the soft delete flag
   * @returns {string} Field name for the soft delete flag
   * @public
   */
  public static getIsDeleted(): string {
    return this.$isDeleted;
  }

  /**
   * Sets the columns to be selected
   * @param {string | string[]} columns Columns to be selected
   * @private
   */
  protected static setColumns(columns: string | string[] = []): void {
    if (Array.isArray(columns)) this.$columns = [...this.$columns, ...columns];
    else this.$columns = [...this.$columns, columns];
  }

  /**
   * Sets the columns to be excluded
   * @param {string | string[]} columns Columns to be excluded
   * @private
   */
  private static setExcludes(columns: string | string[]): void {
    if (Array.isArray(columns))
      this.$excludes = [...this.$excludes, ...columns];
    else this.$excludes = [...this.$excludes, columns];
  }

  /**
   * Adds a basic where clause to the query
   * @param {string} column Column to apply the where clause on
   * @param {any} operator Operator to use
   * @param {any} [value=null] Value to compare against
   * @param {string} [boolean="and"] Boolean operator to use (and/or)
   * @private
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
   * Sets the orders for the query
   * @param {IQueryOrder} doc Orders to be set
   * @private
   */
  private static setOrders(doc: IQueryOrder): void {
    if (Array.isArray(doc)) this.$orders = [...this.$orders, ...doc];
    else this.$orders = [...this.$orders, doc];
  }

  /**
   * Sets the groups for the query
   * @param {string} doc Groups to be set
   * @private
   */
  private static setGroups(doc: string): void {
    if (Array.isArray(doc)) this.$groups = [...this.$groups, ...doc];
    else this.$groups = [...this.$groups, doc];
  }

  /**
   * Checks if the soft delete feature is enabled and applies the necessary conditions
   * @public
   */
  public static checkSoftDelete(): void {
    // Check if soft delete is enabled and apply the necessary conditions
    if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
      this.where(this.$isDeleted, false);
  }

  /**
   * Generates the selected columns for a query
   * @public
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
   * Generates the excluded columns for a query
   * @public
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
   * Generates the conditions for a query
   * @public
   */
  public static generateWheres(): void {
    let $and: Document[] = [];
    let $or: Document[] = [];

    if (this.$id) {
      this.setStages({ $match: { _id: new ObjectId(this.$id) } });
    }

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
   * Generates the orders for a query
   * @protected
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
   * Generates the groups for a query
   * @protected
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
   * Generates the limit for a query
   * @protected
   */
  protected static generateLimit(): void {
    if (this.$limit > 0) this.setStages({ $limit: this.$limit });
  }

  /**
   * Generates the offset for a query
   * @protected
   */
  protected static generateOffset(): void {
    if (this.$offset > 0) this.setStages({ $skip: this.$offset });
  }

  /**
   * Resets all query parameters to their default values
   * @protected
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
    this.$id = null;
  }
}

import { Document, ObjectId } from "mongodb";
import { IOrder, IWhere } from "./interfaces/IQuery"
import Database from "./Database";

export default class Query extends Database {
  /**
   * The current stages to be run.
   *
   * @var mongodb/Document[]
   */
  protected static $stages: Document[] = []

  /**
   * The columns that should be returned.
   *
   * @var array
   */
  protected static $columns: string[] = [];

  /**
   * The columns that should be excluded.
   *
   * @var array
   */
  private static $excludes: string[] = [];

  /**
   * The where constraints for the query.
   *
   * @var array
   */
  private static $wheres: IWhere[] = [];

  /**
   * The orderings for the query.
   *
   * @var array
   */
  private static $orders: IOrder[] = [];

  /**
   * The orderings for the query.
   *
   * @var array
   */
  private static $groups: string[] = [];

  /**
   * The maximum number of records to return.
   *
   * @var int
   */
  private static $limit: number = 15;

  /**
   * The number of records to skip.
   *
   * @var int
   */
  private static $offset: number = 0;

  /**
   * All of the available clause operators.
   *
   * @var string[]
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
   * @param  string|string[]  $columns
   * @return this
   */
  public static select<T extends typeof Query>(this: T, columns: string | string[]) {
    if (Array.isArray(columns))
      this.$columns.push(...columns)
    else
      this.$columns.push(columns)

    return this
  }

  /**
   * Set the columns to be excluded.
   *
   * @param  string|string[]  $columns
   * @return this
   */
  public static exclude<T extends typeof Query>(this: T, columns: string | string[]) {
    if (Array.isArray(columns))
      this.$excludes.push(...columns)
    else
      this.$excludes.push(columns)

    return this
  }

  /**
   * Add a basic where clause to the query.
   *
   * @param  string  column
   * @param  mixed  operator
   * @param  mixed  value
   * @param  string  boolean
   * @return this
   */
  public static where<T extends typeof Query>(
    this: T,
    column: string,
    operator: any,
    value: any = null,
    boolean: string = "and"
  ) {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    this.$wheres.push({ column, operator: _operator, value: _value, boolean })

    return this
  }

  /**
   * Add an "or where" clause to the query.
   *
   * @param  string  column
   * @param  mixed  operator
   * @param  mixed  value
   * @return this
   */
  public static orWhere<T extends typeof Query>(
    this: T,
    column: string,
    operator: string | null = null,
    value: any = null
  ) {
    return this.where(column, operator, value, 'or');
  }

  /**
   * Add a basic "where not" clause to the query.
   *
   * @param  string column
   * @param  mixed  value
   * @param  string  boolean
   * @return this
   */
  public static whereNot(column: string, $value: any, $boolean = 'and') {
    return this.where(column, "ne", $value, $boolean);
  }

  /**
   * Add an "or where not" clause to the query.
   *
   * @param  column
   * @param  mixed  value
   * @return $this
   */
  public static orWhereNot(column: string, value: any) {
    return this.whereNot(column, value, 'or');
  }

  /**
   * Add a "where in" clause to the query.
   *
   * @param  string  column
   * @param  mixed  values
   * @param  string  boolean
   * @param  bool  not
   * @return this
   */
  public static whereIn(column: string, values: any, boolean: string = 'and', not: boolean = false) {
    const type = not ? 'nin' : 'in';

    this.$wheres.push({ column, operator: type, value: values, boolean })

    return this
  }

  /**
   * Add an "or where in" clause to the query.
   *
   * @param  string  column
   * @param  mixed  values
   * @return this
   */
  public static orWhereIn(column: string, values: any) {
    return this.whereIn(column, values, 'or');
  }

  /**
   * Add a "where not in" clause to the query.
   *
   * @param  string  column
   * @param  mixed  values
   * @param  string  boolean
   * @return this
   */
  public static whereNotIn(column: string, values: any, boolean = 'and') {
    return this.whereIn(column, values, boolean, true);
  }

  /**
   * Add an "or where not in" clause to the query.
   *
   * @param  string  column
   * @param  mixed  values
   * @return this
   */
  public static orWhereNotIn(column: string, values: any) {
    return this.whereNotIn(column, values, 'or');
  }

  /**
   * Add a where between statement to the query.
   *
   * @param  string  column
   * @param  string  boolean
   * @param  bool  not
   * @return this
   */
  public static whereBetween(column: string, values: [any, any], boolean: string = 'and', not: boolean = false) {
    this.$wheres.push({
      column,
      operator: "between",
      value: values,
      boolean
    })

    return this;
  }

  /**
   * Add an or where between statement to the query.
   *
   * @param string column
   * @return this
   */
  public static orWhereBetween(column: string, values: [any, any]) {
    return this.whereBetween(column, values, 'or');
  }

  /**
   * Set query with trashed data
   *
   * @return this
   */
  public static withTrashed() {
    return this.where("isDeleted", "eq", true, "or");
  }

  /**
   * Set query only trashed data
   *
   * @return this
   */
  public static onlyTrashed() {
    return this.where("isDeleted", "eq", true, "and");
  }

  /**
   * Alias to set the "offset" value of the query.
   *
   * @param  int  value
   * @return this
   */
  public static skip(value: number) {
    return this.offset(value);
  }

  /**
   * Set the "offset" value of the query.
   *
   * @param  int value
   * @return this
   */
  public static offset(value: number) {
    this.$offset = value

    return this;
  }

  /**
   * Set the "limit" value of the query.
   *
   * @param  int  value
   * @return this
   */
  public static take(value: number) {
    return this.limit(value);
  }

  /**
   * Set the "limit" value of the query.
   *
   * @param  int value
   * @return this
   */
  public static limit(value: number) {
    this.$limit = value

    return this;
  }

  /**
   * Set the limit and offset for a given page.
   *
   * @param  int  page
   * @param  int  perPage
   * @return this
   */
  public static forPage(page: number, perPage: number = 15) {
    return this.offset((page - 1) * perPage).limit(perPage);
  }


  /**
   * Add order by for a query
   *
   * @param  string  column
   * @param  string  order
   * @return this
   */
  static orderBy(
    column: string,
    order: string = "asc",
    isSensitive: boolean = false
  ) {
    this.$orders.push({ column, order, isSensitive })

    return this;
  }

  /**
   * Add group by for a query
   *
   * @param  string  column
   * @return this
   */
  static groupBy(
    column: string,
  ) {
    this.$groups.push(column)

    return this;
  }

  /**
   * Generate selected columns for a query.
   *
   * @return void
  */
  public static generateColumns(): void {
    let $project = {}
    this.$columns.forEach((el) => {
      $project = { ...$project, [el]: 1 }
    })

    if (Object.keys($project).length > 0)
      this.$stages.push({ $project })
  }

  /**
   * Generate excluded columns for a query.
   *
   * @return void
  */
  public static generateExcludes(): void {
    let $project = {}
    this.$excludes.forEach((el) => {
      $project = { ...$project, [el]: 0 }
    })

    if (Object.keys($project).length > 0)
      this.$stages.push({ $project })
  }

  /**
   * Generate conditions for a query.
   *
   * @return void
  */
  public static generateWheres(): void {
    let $and: Document[] = []
    let $or: Document[] = []

    this.$wheres.forEach(el => {
      const op = this.$operators.find(
        (op) => op.operator === el.operator || op.mongoOperator === el.operator
      );

      const value = el.column === "_id" ? new ObjectId(el.value) : el.value

      let condition = {
        [el.column]: {
          [`$${op?.mongoOperator}`]: value
        },
        $options: op?.options
      }

      if (el.operator === "between")
        condition = {
          [el.column]: {
            $gte: el.value?.[0],
            $lte: el.value?.[el.value.length - 1],
          },
          $options: op?.options
        }

      if (!condition.$options) delete condition.$options

      if (el.boolean === "and") $and.push(condition)
      else $or.push(condition)
    })

    if ($or.length > 0) {
      if ($and.length > 0)
        $or.push({ $and })

      this.$stages.push({ $match: { $or } })
      return
    }

    if ($and.length > 0)
      this.$stages.push({ $match: { $and } })
  }

  /**
   * Generate orders for a query.
   *
   * @return void
  */
  static generateOrders() {
    let $project = {
      document: "$$ROOT",
    }

    let $sort = {}

    this.$orders.forEach(el => {
      $project = { ...$project, [el.column]: 1 }

      if (el.isSensitive) {
        $project = { ...$project, [`lowercase_${el.column}`]: { $toLower: `$${el.column}` } }
        $sort = {
          ...$sort, [`lowercase_${el.column}`]: el.order
        }
      } else $sort = { ...$sort, [el.column]: el.order }
    })

    const orders = [
      { $project },
      { $sort },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
    ]

    if (this.$orders.length > 0)
      this.$stages.push(...orders)
  }

  /**
   * Generate groups for a query.
   *
   * @return void
  */
  static generateGroups() {
    let _id = {}

    this.$groups.forEach(el => {
      _id = { ..._id, [el]: `$${el}` }
    })

    const $group = {
      _id,
      count: { $sum: 1 }
    }

    if (this.$groups.length > 0)
      this.$stages.push({ $group })
  }

  /**
   * Reset query state. 
   *
   * @return void
  */
  protected static resetQuery() {
    this.$stages = []
    this.$excludes = []
    this.$wheres = []
    this.$orders = []
    this.$groups = []
  }
}

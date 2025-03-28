import { Db, Document, ObjectId } from "mongodb";
import Collection from "./Collection";
import {
  MONGOLOQUENT_DATABASE_NAME,
  MONGOLOQUENT_DATABASE_URI,
  TIMEZONE,
} from "./configs/app";
import Database from "./Database";
import { FormSchema } from "./types/schema";
import { IQueryOrder, IQueryWhere } from "./interfaces/IQuery";
import operators from "./utils/operators";
import dayjs from "./utils/dayjs";

export default class QueryBuilder<T> {
  static $schema: Record<string, any>;
  protected static $connection: string = MONGOLOQUENT_DATABASE_URI;
  protected static $databaseName: string = MONGOLOQUENT_DATABASE_NAME;
  protected static $collection: string = "";
  protected static $useSoftDelete: boolean = false;
  protected static $useTimestamps: boolean = true;

  protected $original: Partial<T> = {};
  protected $changes: Partial<Record<keyof T, { old: any; new: any }>> = {};
  private $isProxied: boolean = false;

  protected $connection: string = "";
  protected $databaseName: string = "";
  protected $collection: string = "mongoloquent";
  protected $useTimestamps: boolean = true;
  protected $useSoftDelete: boolean = false;

  private $timezone: string = TIMEZONE;
  private $createdAt: string = "createdAt";
  private $updatedAt: string = "updatedAt";
  private $id: string | ObjectId | null = null;
  private $stages: Document[] = [];
  private $columns: (keyof T)[] = [];
  private $excludes: (keyof T)[] = [];
  private $wheres: IQueryWhere[] = [];
  private $orders: IQueryOrder[] = [];
  private $groups: (keyof T)[] = [];
  protected $isDeleted: string = "isDeleted";
  protected $deletedAt: string = "deletedAt";
  private $withTrashed: boolean = false;
  private $onlyTrashed: boolean = false;
  protected $limit: number = 0;
  private $offset: number = 0;

  constructor() {
    this.$connection = (this.constructor as typeof QueryBuilder).$connection;
    this.$databaseName = (
      this.constructor as typeof QueryBuilder
    ).$databaseName;
    this.$collection =
      (this.constructor as typeof QueryBuilder).$collection ||
      `${this.constructor.name.toLowerCase()}s`;
    this.$useSoftDelete = (
      this.constructor as typeof QueryBuilder
    ).$useSoftDelete;
    this.$useTimestamps = (
      this.constructor as typeof QueryBuilder
    ).$useTimestamps;
  }

  private getCollection() {
    const db = Database.getDb(this.$connection, this.$databaseName);
    return db.collection<FormSchema<T>>(this.$collection);
  }

  public select<K extends keyof T>(...columns: (K | K[])[]): QueryBuilder<T> {
    this.setColumns(...columns);
    return this;
  }

  public exclude<K extends keyof T>(...columns: (K | K[])[]): QueryBuilder<T> {
    this.setExcludes(...columns);
    return this;
  }

  public where<K extends keyof T>(
    column: K,
    operator: any,
    value: any = null
  ): QueryBuilder<T> {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    this.setWheres(column, _operator, _value, "and");

    return this;
  }

  public orWhere<K extends keyof T>(
    column: K,
    operator: any,
    value: any = null
  ): QueryBuilder<T> {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    this.setWheres(column, _operator, _value, "or");

    return this;
  }

  public whereNot<K extends keyof T>(column: K, value: any): QueryBuilder<T> {
    this.setWheres(column, "ne", value, "and");

    return this;
  }

  public orWhereNot<K extends keyof T>(column: K, value: any): QueryBuilder<T> {
    this.setWheres(column, "ne", value, "or");

    return this;
  }

  public whereIn<K extends keyof T>(column: K, values: any[]): QueryBuilder<T> {
    this.setWheres(column, "in", values, "and");

    return this;
  }

  public orWhereIn<K extends keyof T>(
    column: K,
    values: any[]
  ): QueryBuilder<T> {
    this.setWheres(column, "in", values, "or");

    return this;
  }

  public whereNotIn<K extends keyof T>(
    column: K,
    values: any[]
  ): QueryBuilder<T> {
    this.setWheres(column, "nin", values, "and");

    return this;
  }

  public orWhereNotIn<K extends keyof T>(
    column: K,
    values: any[]
  ): QueryBuilder<T> {
    this.setWheres(column, "nin", values, "or");

    return this;
  }

  public whereBetween<K extends keyof T>(
    column: K,
    values: [number, number?]
  ): QueryBuilder<T> {
    this.setWheres(column, "between", values, "and");

    return this;
  }

  public orWhereBetween<K extends keyof T>(
    column: K,
    values: [number, number?]
  ): QueryBuilder<T> {
    this.setWheres(column, "between", values, "or");

    return this;
  }

  public whereNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "eq", null, "and");

    return this;
  }

  public orWhereNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "eq", null, "or");

    return this;
  }

  public whereNotNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "ne", null, "and");

    return this;
  }

  public orWhereNotNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "ne", null, "or");

    return this;
  }

  public withTrashed(): QueryBuilder<T> {
    this.$withTrashed = true;

    return this;
  }

  public onlyTrashed(): QueryBuilder<T> {
    this.$onlyTrashed = true;
    return this;
  }

  public offset(value: number): QueryBuilder<T> {
    this.$offset = value;

    return this;
  }

  public skip(value: number): QueryBuilder<T> {
    return this.offset(value);
  }

  public limit(value: number): QueryBuilder<T> {
    this.$limit = value;

    return this;
  }

  public orderBy<K extends keyof T>(
    column: K,
    direction: "asc" | "desc" = "asc",
    caseSensitive: boolean = false
  ): this {
    const payload = {
      column,
      order: direction,
      caseSensitive: caseSensitive,
    } as any;
    this.setOrders(payload);

    return this;
  }

  public async get<K extends keyof T>(...fields: (K | K[])[]): Promise<T[]> {
    try {
      this.setColumns(...fields);
      const aggregate = await this.aggregate();
      const data = (await aggregate.toArray()) as T[];
      const collection = new Collection(...data);
      return collection;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching documents failed`);
    }
  }

  public async all(): Promise<T[]> {
    return this.get();
  }

  public async first<K extends keyof T>(
    ...fields: (K | K[])[]
  ): Promise<this & T> {
    let data = await this.get(...fields);
    if (data && data.length > 0) {
      this.$original = { ...data[0] };
    }

    let result = data[0] as T;
    const self = this;
    const handler = {
      set(target: any, prop: string, value: any) {
        // @ts-ignore
        if (prop in result) {
          self.trackChange(prop as keyof T, value);
        }
        target[prop] = value;
        return true;
      },
    };

    // Assign properties to this instance
    Object.assign(this, result);

    // Create a proxy for the combined object
    return new Proxy(this, handler) as this & T;
  }

  public async find(id: string | ObjectId) {
    const _id = new ObjectId(id);
    this.setId(_id);
    return this.first();
  }

  public hasChanges(): boolean {
    return Object.keys(this.$changes).length > 0;
  }

  public isDirty<K extends keyof T>(field?: K): boolean {
    if (field) {
      return field in this.$changes;
    }
    return this.hasChanges();
  }

  public getChanges(): Partial<Record<keyof T, { old: any; new: any }>> {
    const changes = { ...this.$changes };

    // Remove any property starting with $
    for (const key in changes) {
      if (key.startsWith("$")) {
        delete changes[key];
      }
    }

    return changes;
  }

  protected createProxy(): this & T {
    if (this.$isProxied) return this as this & T;

    const self = this;
    const handler = {
      set(target: any, prop: string, value: any) {
        if (typeof prop === "string" && prop !== "$isProxied") {
          self.trackChange(prop as keyof T, value);
        }
        target[prop] = value;
        return true;
      },
    };

    this.$isProxied = true;
    return new Proxy(this, handler) as this & T;
  }

  protected trackChange<K extends keyof T>(field: K, value: any): void {
    // If field is not in $original, initialize it
    if (!(field in this.$original)) {
      // Get initial value from schema if possible
      const schema = (this.constructor as any).$schema;
      this.$original[field] =
        schema && field in schema ? schema[field] : undefined;
    }

    // Only track changes if the value is different
    if (this.$original[field] !== value) {
      // Skip tracking for $original property
      if (field === ("$original" as any)) {
        return;
      }

      if (!this.$changes[field]) {
        this.$changes[field] = {
          old: this.$original[field],
          new: value,
        };
      } else {
        this.$changes[field]!.new = value;
      }
      console.log(
        `Changed ${String(field)} from ${this.$original[field]} to ${value}`
      );
    }
  }

  private setId(id: ObjectId | string) {
    this.$id = id;
  }

  private setStages(doc: Document | Document[]): void {
    if (Array.isArray(doc)) this.$stages = [...this.$stages, ...doc];
    else this.$stages = [...this.$stages, doc];
  }

  protected getStages(): Document[] {
    return this.$stages;
  }

  private setColumns<K extends keyof T>(...columns: (K | K[])[]): void {
    if (Array.isArray(columns)) {
      const flattenedColumns = columns.flat() as unknown as keyof T[];
      this.$columns = [
        ...this.$columns,
        ...(flattenedColumns as unknown as (keyof T)[]),
      ];
    } else this.$columns = [...this.$columns, columns];
  }

  private setExcludes<K extends keyof T>(...columns: (K | K[])[]): void {
    if (Array.isArray(columns)) {
      const flattenedColumns = columns.flat() as unknown as keyof T[];
      this.$excludes = [
        ...this.$excludes,
        ...(flattenedColumns as unknown as (keyof T)[]),
      ];
    } else this.$excludes = [...this.$excludes, columns];
  }

  private setWheres<K extends keyof T>(
    column: K,
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
    ] as any;
  }

  private setOrders(doc: IQueryOrder): void {
    if (Array.isArray(doc)) this.$orders = [...this.$orders, ...doc];
    else this.$orders = [...this.$orders, doc];
  }

  private setGroups<K extends keyof T>(doc: K): void {
    if (Array.isArray(doc)) this.$groups = [...this.$groups, ...doc];
    else this.$groups = [...this.$groups, doc];
  }

  public getIsDeleted() {
    return this.$isDeleted;
  }

  private checkSoftDelete<K extends keyof T>(): void {
    if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
      this.where(this.$isDeleted as K, false);
  }

  private generateColumns(): void {
    let $project = {};
    // Add each selected column to the $project stage
    this.$columns.forEach((el) => {
      $project = { ...$project, [el]: 1 };
    });

    // Add the $project stage to the $stages array if there are selected columns
    if (Object.keys($project).length > 0) this.$stages.push({ $project });
  }

  private generateExcludes(): void {
    let $project = {};
    // Add each excluded column to the $project stage
    this.$excludes.forEach((el) => {
      $project = { ...$project, [el]: 0 };
    });

    // Add the $project stage to the $stages array if there are excluded columns
    if (Object.keys($project).length > 0) this.$stages.push({ $project });
  }

  private generateWheres(): void {
    let $and: Document[] = [];
    let $or: Document[] = [];

    if (this.$id) {
      this.setStages({ $match: { _id: new ObjectId(this.$id) } });
    }

    // sort by type(E/R/S) for better peformace query in MongoDB
    this.$wheres.sort().forEach((el) => {
      const op = operators.find(
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

  private generateOrders(): void {
    let $project = {
      document: "$$ROOT",
    };

    let $sort = {};

    this.$orders.forEach((el) => {
      $project = { ...$project, [el.column]: 1 };
      const direction = el.order === "asc" ? 1 : -1;

      if (el.caseSensitive) {
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

  private generateGroups(): void {
    let _id = {};

    this.$groups.forEach((el: any) => {
      _id = { ..._id, [el]: `$${el}` };
    });

    const $group = {
      _id,
      count: { $sum: 1 },
    };

    if (this.$groups.length > 0) this.setStages({ $group });
  }

  protected generateLimit(): void {
    if (this.$limit > 0) this.setStages({ $limit: this.$limit });
  }

  protected generateOffset(): void {
    if (this.$offset > 0) this.setStages({ $skip: this.$offset });
  }

  private async aggregate() {
    try {
      // Check if soft delete is enabled and apply necessary filters
      this.checkSoftDelete();
      // Generate the columns to be selected in the query
      this.generateColumns();
      // Generate the columns to be excluded from the query
      this.generateExcludes();
      // Generate the where conditions for the query
      this.generateWheres();
      this.generateOffset();
      this.generateLimit();
      // Generate the order by conditions for the query
      this.generateOrders();
      // Generate the group by conditions for the query
      this.generateGroups();

      // Get the collection from the database
      const collection = this.getCollection();
      // Execute the aggregation pipeline with the generated stages and lookups
      const stages = this.getStages();
      //const lookups = this.getLookups();
      const aggregate = collection?.aggregate([...stages]);

      // Reset the query and relation states
      this.resetQuery();

      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
  }

  private resetQuery(): void {
    this.$withTrashed = false;
    this.$onlyTrashed = false;
    this.$stages = [];
    this.$columns = [];
    this.$excludes = [];
    this.$wheres = [];
    this.$orders = [];
    this.$groups = [];
    this.$offset = 0;
    this.$limit = 0;
  }

  private checkUseTimestamps(
    doc: Partial<FormSchema<T>>,
    isNew: boolean = true
  ): Partial<FormSchema<T>> {
    if (this.$useTimestamps) {
      const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
      const now = dayjs.utc(current).tz(this.$timezone).toDate();

      if (!isNew) return { ...doc, [this.$updatedAt]: now };

      return { ...doc, [this.$createdAt]: now, [this.$updatedAt]: now };
    }

    return doc;
  }

  private checkUseSoftdelete(
    doc: Partial<FormSchema<T>>,
    isDeleted: boolean = false
  ): Partial<FormSchema<T>> {
    if (this.$useSoftDelete) {
      if (isDeleted) {
        const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
        const now = dayjs.utc(current).tz(this.$timezone).toDate();

        return { ...doc, [this.$isDeleted]: true, [this.$deletedAt]: now };
      }

      return { ...doc, [this.$isDeleted]: false };
    }

    return doc;
  }
}

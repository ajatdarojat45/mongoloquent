import {
  BulkWriteOptions,
  Document,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateOptions,
} from "mongodb";
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
import { MongoloquentNotFoundException } from "./exceptions/MongoloquentException";
import { IModelPaginate } from "./interfaces/IModel";

export default class QueryBuilder<T> {
  static $schema: Record<string, any>;
  protected static $connection: string = MONGOLOQUENT_DATABASE_URI;
  protected static $databaseName: string = MONGOLOQUENT_DATABASE_NAME;
  protected static $collection: string = "";
  protected static $useSoftDelete: boolean = false;
  protected static $useTimestamps: boolean = true;
  protected static $isDeleted: string = "isDeleted";

  private $timezone: string = TIMEZONE;
  private $createdAt: string = "createdAt";
  private $updatedAt: string = "updatedAt";
  private $stages: Document[] = [];
  private $columns: (keyof T)[] = [];
  private $excludes: (keyof T)[] = [];
  private $wheres: IQueryWhere[] = [];
  private $orders: IQueryOrder[] = [];
  private $groups: (keyof T)[] = [];
  private $withTrashed: boolean = false;
  private $onlyTrashed: boolean = false;
  private $offset: number = 0;

  protected $id: string | ObjectId | null = null;
  protected $original: Partial<T> = {};
  protected $changes: Partial<Record<keyof T, any>> = {};
  protected $connection: string = "";
  protected $databaseName: string = "";
  protected $collection: string = "mongoloquent";
  protected $useTimestamps: boolean = true;
  protected $useSoftDelete: boolean = false;
  protected $lookups: Document[] = [];
  protected $isDeleted: string = "isDeleted";
  protected $deletedAt: string = "deletedAt";
  protected $limit: number = 0;

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
    this.$isDeleted = (this.constructor as typeof QueryBuilder).$isDeleted;
  }

  private getCollection(collection?: string) {
    const db = Database.getDb(this.$connection, this.$databaseName);
    return db.collection<FormSchema<T>>(collection || this.$collection);
  }

  public async insert(doc: FormSchema<T>, options?: InsertOneOptions) {
    try {
      const collection = this.getCollection();
      let newDoc = this.checkUseTimestamps(doc);
      newDoc = this.checkUseSoftdelete(newDoc);
      //      newDoc = this.checkRelationship(newDoc);

      const data = await collection?.insertOne(
        newDoc as OptionalUnlessRequiredId<FormSchema<T>>,
        options
      );

      this.resetQuery();
      return { _id: data?.insertedId as ObjectId, ...newDoc } as T;
    } catch (error) {
      throw new Error(`Inserting document failed`);
    }
  }

  public async create(
    doc: FormSchema<T>,
    options?: InsertOneOptions
  ): Promise<T> {
    return this.insert(doc, options);
  }

  public async insertMany(
    docs: FormSchema<T>[],
    options?: BulkWriteOptions
  ): Promise<ObjectId[]> {
    try {
      const collection = this.getCollection();
      const newDocs = docs.map((el) => {
        let newEl = this.checkUseTimestamps(el);
        newEl = this.checkUseSoftdelete(newEl);
        // newEl = this.checkRelationship(newEl);

        return newEl;
      });

      // Insert the documents into the collection
      const data = await collection?.insertMany(
        newDocs as OptionalUnlessRequiredId<FormSchema<T>>[],
        options
      );

      const result: ObjectId[] = [];

      // Extract the inserted IDs from the result
      for (const key in data?.insertedIds) {
        result.push(
          data?.insertedIds[key as unknown as keyof typeof data.insertedIds]
        );
      }

      this.resetQuery();
      return result;
    } catch (error) {
      console.log(error);
      throw new Error(`Inserting multiple documents failed`);
    }
  }

  public async createMany(
    docs: FormSchema<T>[],
    options?: BulkWriteOptions
  ): Promise<ObjectId[]> {
    return this.insertMany(docs, options);
  }

  public async update(
    doc: Partial<FormSchema<T>>,
    options: FindOneAndUpdateOptions = {}
  ) {
    try {
      const collection = this.getCollection();
      //     await this.checkRelation();
      this.checkSoftDelete();
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;
      let newDoc = this.checkUseTimestamps(doc, false);
      newDoc = this.checkUseSoftdelete(newDoc);
      delete (newDoc as any)._id;

      const data = await collection.findOneAndUpdate(
        { ...filter },
        {
          $set: {
            ...(newDoc as Partial<T>),
          },
        },
        {
          ...options,
          returnDocument: "after",
        }
      );

      // Reset the query and relation states
      this.resetQuery();
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(`Updating documents failed`);
    }
  }

  async updateOrCreate(filter: Partial<T>, doc: Partial<FormSchema<T>>) {
    for (var key in filter) {
      if (doc.hasOwnProperty(key)) {
        this.where(key, filter[key]);
      }
    }

    const data = await this.update(doc);
    if (data) return data;

    return this.insert(doc as FormSchema<T>);
  }

  async updateOrInsert(filter: Partial<T>, doc: Partial<FormSchema<T>>) {
    return this.updateOrCreate(filter, doc);
  }

  public async updateMany(
    doc: Partial<FormSchema<T>>,
    options?: UpdateOptions
  ): Promise<number> {
    try {
      const collection = this.getCollection();

      //     await this.checkRelation();
      this.checkSoftDelete();
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;
      let newDoc = this.checkUseTimestamps(doc, false);
      newDoc = this.checkUseSoftdelete(newDoc);
      delete (newDoc as any)._id;

      // Update the documents in the collection
      const data = await collection.updateMany(
        { ...filter },
        {
          $set: {
            ...(newDoc as Partial<T>),
          },
        },
        options
      );

      // Reset the query and relation states
      this.resetQuery();
      return data.modifiedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Updating multiple documents failed`);
    }
  }

  public async save() {
    let payload = {};
    for (const key in this.$changes) {
      if (key.startsWith("$") || key === "_id") continue;
      payload = {
        ...payload,
        // @ts-ignore
        [key]: this.$changes[key],
      };
    }

    if (Object.keys(this.$original).length === 0) {
      return this.insert(payload as FormSchema<T>);
    } else {
      // @ts-ignore
      const id = this.$original?._id;
      return this.where("_id" as keyof T, id).update(payload as FormSchema<T>);
    }
  }

  public async delete(): Promise<number> {
    try {
      const collection = this.getCollection();
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      if (this.$useSoftDelete) {
        let doc = this.checkUseTimestamps({}, false);
        doc = this.checkUseSoftdelete(doc, true);

        const data = await collection?.updateMany(
          { ...filter },
          {
            $set: {
              ...(doc as Partial<T>),
            },
          }
        );

        this.resetQuery();

        return data?.modifiedCount || 0;
      }

      const data = await collection?.deleteMany(filter);
      this.resetQuery();

      return data?.deletedCount || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Deleting multiple documents failed`);
    }
  }

  public async destroy(...ids: (string | ObjectId)[]): Promise<number> {
    ids = ids.map((el) => {
      if (typeof el === "string") return new ObjectId(el);
      return el;
    });
    this.where("_id" as keyof T, "in", ids);
    return this.delete();
  }

  public async forceDestroy(...ids: (string | ObjectId)[]): Promise<number> {
    try {
      ids = ids.map((el) => {
        if (typeof el === "string") return new ObjectId(el);
        return el;
      });
      this.where("_id" as keyof T, "in", ids);
      this.onlyTrashed();
      this.generateWheres();
      const stages = this.getStages();

      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      const collection = this.getCollection();
      const data = await collection.deleteMany(filter);
      this.resetQuery();

      return data.deletedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Force deleting documents failed`);
    }
  }

  public async restore(): Promise<number> {
    try {
      this.onlyTrashed();
      const payload = {
        [this.$isDeleted]: false,
        [this.$deletedAt]: null,
      } as Partial<FormSchema<T>>;
      return await this.updateMany(payload);
    } catch (error) {
      console.log(error);
      throw new Error(`Restoring documents failed`);
    }
  }

  public fill(doc: Partial<FormSchema<T>>) {
    Object.assign(this, doc);
    return this;
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

  public async get<K extends keyof T>(...fields: (K | K[])[]) {
    try {
      this.setColumns(...fields);
      const aggregate = await this.aggregate();
      const data = (await aggregate.toArray()) as T[];
      const collection = new Collection<T>(...data);
      return collection;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching documents failed`);
    }
  }

  public async all(): Promise<T[]> {
    return this.get();
  }

  public async pluck<K extends keyof T>(...fields: (K | K[])[]) {
    const result = await this.get(...fields);
    const flattenedFields = fields.flat() as K[];
    return result.pluck(...flattenedFields);
  }

  public async paginate(
    page: number = 1,
    limit: number = this.$limit
  ): Promise<IModelPaginate> {
    try {
      // await this.checkRelation();
      this.checkSoftDelete();
      this.generateColumns();
      this.generateExcludes();
      this.generateWheres();
      this.generateOrders();
      this.generateGroups();

      const collection = this.getCollection();
      const stages = this.getStages();
      // const lookups = this.getLookups();
      const aggregate = collection.aggregate([...stages]);

      let totalResult = await collection
        .aggregate([
          ...stages,
          {
            $count: "total",
          },
        ])
        .next();
      let total = 0;

      if (totalResult?.total) total = totalResult?.total;

      const result = await aggregate
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      // Reset the query and relation states
      this.resetQuery();

      return {
        data: result,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error(`Pagination failed`);
    }
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
    // @ts-ignore
    this.$id = result?._id;
    Object.assign(this, result);

    // Create a proxy for the combined object
    return new Proxy(this, handler) as this & T;
  }

  public async firstOrCreate(filter: Partial<T>, doc: Partial<FormSchema<T>>) {
    for (var key in filter) {
      if (doc.hasOwnProperty(key)) {
        this.where(key, filter[key]);
      }
    }

    const data = await this.first();
    if (data && Object.keys(data.$original).length > 0) return data;

    return this.insert(doc as FormSchema<T>);
  }

  public async firstOrNew(filter: Partial<T>, doc: Partial<FormSchema<T>>) {
    return this.firstOrCreate(filter, doc);
  }

  public async firstOrFail<K extends keyof T>(...columns: (K | K[])[]) {
    const data = await this.first(...columns);
    if (data && Object.keys(data.$original).length === 0) {
      throw new MongoloquentNotFoundException();
    }

    return data;
  }

  public async find(id: string | ObjectId) {
    const _id = new ObjectId(id);
    this.setId(_id);
    return this.first();
  }

  public async findOrFail(id: string | ObjectId) {
    const data = await this.find(id);
    if (data && Object.keys(data.$original).length === 0) {
      throw new MongoloquentNotFoundException();
    }
    return data;
  }

  public async count(): Promise<number> {
    try {
      const collection = this.getCollection();

      //     await this.checkRelation();
      this.checkSoftDelete();
      this.generateWheres();

      const stages = this.getStages();
      const aggregate = await collection
        .aggregate([
          ...stages,
          {
            $count: "total",
          },
        ])
        .next();

      this.resetQuery();
      return aggregate?.total || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching document count failed`);
    }
  }

  public async max<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "max");
  }

  public async min<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "min");
  }

  public async avg<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "avg");
  }

  public async sum<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "sum");
  }

  private async aggregates<K extends keyof T>(
    field: K,
    type: "avg" | "sum" | "max" | "min"
  ): Promise<number> {
    try {
      const collection = this.getCollection();
      //await this.checkRelation();
      this.checkSoftDelete();
      this.generateWheres();

      const stages = this.getStages();
      const aggregate = await collection
        .aggregate([
          ...stages,
          {
            $group: {
              _id: null,
              [type]: {
                // @ts-ignore
                [`$${type}`]: `$${field}`,
              },
            },
          },
        ])
        .next();

      // Reset the query state
      this.resetQuery();
      return typeof aggregate?.[type] === "number" ? aggregate[type] : 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching maximum value failed`);
    }
  }

  public hasChanges(): boolean {
    return Object.keys(this.$changes).length > 0;
  }

  public isDirty<K extends keyof T>(...fields: (K | K[])[]): boolean {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      return flattenedFields.some((field) => field in this.$changes);
    }

    return this.hasChanges();
  }

  public isClean<K extends keyof T>(...fields: (K | K[])[]): boolean {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      return flattenedFields.every((field) => !(field in this.$changes));
    }
    return !this.hasChanges();
  }

  public wasChanged<K extends keyof T>(...fields: (K | K[])[]): boolean {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      return flattenedFields.some((field) => {
        const _new = this.$changes[field];
        const old = this.$original[field];
        return _new && old !== _new;
      });
    }
    return this.hasChanges();
  }

  public getChanges(): Partial<Record<keyof T, { old: any; new: any }>> {
    const changes: Partial<Record<keyof T, { old: any; new: any }>> = {};
    // Remove any property starting with $
    for (const key in this.$changes) {
      if (key.startsWith("$")) continue;
      const _new = this.$changes[key];
      const old = this.$original[key];
      if (_new && old !== _new) {
        changes[key] = _new;
      }
    }

    return changes;
  }

  public getOriginal<K extends keyof T>(...fields: (K | K[])[]): any {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      const original: Partial<Record<keyof T, any>> = {};
      flattenedFields.forEach((field) => {
        if (field in this.$original) {
          original[field] = this.$original[field];
        }
      });
      return original;
    }
    return this.$original;
  }

  public refresh(): QueryBuilder<T> {
    this.$changes = {};
    Object.assign(this, this.$original);
    return this;
  }

  protected createProxy(): this & T {
    return new Proxy(this, {
      set: (target, prop, value) => {
        // @ts-ignore
        if (!prop.startsWith("$") && value !== target.$original[prop]) {
          // @ts-ignore
          target.$changes[prop] = value;
        }

        // @ts-ignore
        target[prop] = value;
        return true;
      },
    }) as this & T;
  }

  protected trackChange<K extends keyof T>(field: K, value: any): void {
    // check if property starts with $

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
        this.$changes[field] = value;
      } else {
        this.$changes[field] = value;
      }
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

  protected getLookups(): Document[] {
    return this.$lookups;
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

  protected setLookups(doc: Document): void {
    if (Array.isArray(doc)) this.$lookups = [...this.$lookups, ...doc];
    else this.$lookups = [...this.$lookups, doc];
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
      this.checkSoftDelete();
      this.generateWheres();
      this.generateColumns();
      this.generateExcludes();
      this.generateOffset();
      this.generateLimit();
      this.generateOrders();
      this.generateGroups();

      const collection = this.getCollection();
      const stages = this.getStages();
      const lookups = this.getLookups();
      const aggregate = collection?.aggregate([...stages, ...lookups]);

      this.resetQuery();

      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
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
}

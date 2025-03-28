import { Db } from "mongodb";
import { IQueryBuilder } from "../interfaces/IQuery";
import {
  MONGOLOQUENT_DATABASE_NAME,
  MONGOLOQUENT_DATABASE_URI,
} from "../configs/app";
import Database from "../Database";
import Collection from "./Collection";
import { FormSchema } from "../types/schema";

export default class QueryBuilder<T> {
  static $schema: Record<string, any>;
  static $connection: string = MONGOLOQUENT_DATABASE_URI;
  static $databaseName: string = MONGOLOQUENT_DATABASE_NAME;
  static $collection: string = "";
  static $useSoftDelete: boolean = false;
  static $useTimestamps: boolean = true;

  protected $original: Partial<T> = {};
  protected $changes: Partial<Record<keyof T, { old: any; new: any }>> = {};
  private $isProxied: boolean = false;

  protected $connection: string = "";
  protected $databaseName: string = "";
  protected $collection: string = "mongoloquent";
  protected $db: Db;
  protected $useTimestamps: boolean = true;
  protected $useSoftDelete: boolean = false;

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
    this.$db = Database.getDb(this.$connection, this.$databaseName);
  }

  public where<K extends keyof T>(field: K): QueryBuilder<T> {
    return this;
  }

  public async get<K extends keyof T>(...fields: (K | K[])[]): Promise<T[]> {
    // const allFields = fields.flat();
    try {
      // Execute the aggregation pipeline
      const aggregate = await this.aggregate();

      // Convert the aggregation cursor to an array of documents
      const data = (await aggregate.toArray()) as T[];

      const collection = new Collection(...data);
      return collection;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching documents failed`);
    }
  }

  public async first<K extends keyof T>(
    ...fields: (K | K[])[]
  ): Promise<this & T> {
    const allFields = fields.flat();
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

  private getCollection() {
    return this.$db.collection<FormSchema<T>>(this.$collection);
  }

  private async aggregate() {
    try {
      const collection = this.getCollection();
      const aggregate = collection?.aggregate([]);
      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
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
}

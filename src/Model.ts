import { time } from "console";
import QueryBuilder from "./QueryBuilder";
import { BulkWriteOptions, Document, FindOneAndUpdateOptions, InsertOneOptions, ObjectId, UpdateFilter, UpdateOptions } from "mongodb";

export default class Model {
  protected static $connection: string;
  protected static $databaseName: string;
  protected static $collection: string;
  protected static $useSoftDelete: boolean = false;
  protected static $useTimestamps: boolean = true;

  public static async insert(doc: object, options?: InsertOneOptions): Promise<any> {
    return this.query().insert(doc, options);
  }

  public static async insertMany(docs: object[], options?: BulkWriteOptions): Promise<ObjectId[]> {
    return this.query().insertMany(docs, options);
  }

  public static async update(doc: UpdateFilter<Document>, options: FindOneAndUpdateOptions = {}) {
    return this.query().update(doc, options)
  }

  public static async updateOrCreate(filter: { [key: string]: any }, doc: { [key: string]: any }) {
    return this.query().updateOrCreate(filter, doc)
  }

  public static async updateMany(doc: UpdateFilter<Document>, options?: UpdateOptions): Promise<number> {
    return this.query().updateMany(doc, options)
  }

  public static async destroy(ids: string | string[] | ObjectId | ObjectId[]): Promise<number> {
    return this.query().destroy(ids);
  }

  public static async delete(): Promise<number> {
    return this.query().delete();
  }

  public static select(columns: string | string[]): QueryBuilder {
    return this.query().select(columns);
  }

  public static exclude(columns: string | string[]): QueryBuilder {
    return this.query().exclude(columns);
  }

  public static where(column: string, operator: any, value: any = null): QueryBuilder {
    return this.query().where(column, operator, value);
  }

  public static orWhere(column: string, operator: any, value: any = null) {
    return this.query().orWhere(column, operator, value);
  }

  public static whereNot(column: string, value: any): QueryBuilder {
    return this.query().whereNot(column, value);
  }

  public static orWhereNot(column: string, value: any): QueryBuilder {
    return this.query().whereNot(column, value);
  }

  public static whereIn(column: string, values: any[]): QueryBuilder {
    return this.query().whereIn(column, values);
  }

  public static orWhereIn(column: string, values: any[]): QueryBuilder {
    return this.query().orWhereIn(column, values);
  }

  public static whereNotIn(column: string, values: any[]): QueryBuilder {
    return this.query().whereNotIn(column, values);
  }

  public static orWhereNotIn(column: string, values: any[]): QueryBuilder {
    return this.query().orWhereNotIn(column, values);
  }

  public static whereBetween(column: string, values: [number, number?]): QueryBuilder {
    return this.query().whereBetween(column, values);
  }

  public static orWhereBetween(column: string, values: [number, number?]): QueryBuilder {
    return this.query().orWhereBetween(column, values);
  }

  public static whereNull(column: string): QueryBuilder {
    return this.query().whereNull(column);
  }

  public static OrWhereNull(column: string): QueryBuilder {
    return this.query().OrWhereNull(column);
  }

  public static whereNotNull(column: string): QueryBuilder {
    return this.query().whereNotNull(column);
  }

  public static orWhereNotNull(column: string): QueryBuilder {
    return this.query().orWhereNotNull(column);
  }

  public static withTrashed(): QueryBuilder {
    return this.query().withTrashed();
  }

  public static onlyTrashed(): QueryBuilder {
    return this.query().onlyTrashed();
  }

  public static offset(value: number): QueryBuilder {
    return this.query().offset(value);
  }

  public static skip(value: number): QueryBuilder {
    return this.query().skip(value);
  }

  public static limit(value: number): QueryBuilder {
    return this.query().limit(value);
  }

  public static take(value: number): QueryBuilder {
    return this.query().take(value);
  }

  public static forPage(page: number, limit: number = 15): QueryBuilder {
    return this.query().forPage(page, limit);
  }

  public static orderBy(column: string, order: string = "asc", caseSensitive: boolean = false): QueryBuilder {
    return this.query().orderBy(column, order, caseSensitive);
  }

  public static groupBy(column: string): QueryBuilder {
    return this.query().groupBy(column);

  }

  public static async find(id: string | ObjectId) {
    return this.query().find(id);
  }

  public static async all() {
    return this.query().all();
  }

  public static async get(columns: string | string[] = []) {
    return this.query().get(columns);
  }

  public static async first(columns: string | string[] = []) {
    return this.query().first(columns);
  }

  public static async firstOrFail(columns: string | string[] = []) {
    return this.query().firstOrFail(columns);
  }

  public static async firstOrCreate(doc: object) {
    return this.query().firstOrCreate(doc);
  }

  public static async count(): Promise<number> {
    return this.query().count()
  }

  private static query(): QueryBuilder {
    return new QueryBuilder({
      connection: this.$connection,
      databaseName: this.$databaseName,
      collection: this.$collection || `${this.name.toLowerCase()}s`,
      useSoftDelete: this.$useSoftDelete,
      useTimestamps: this.$useTimestamps,
    });
  }
}

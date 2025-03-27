import {
  BulkWriteOptions,
  Document,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  ObjectId,
  UpdateFilter,
  UpdateOptions,
} from "mongodb";
import { FormSchema } from "./types/schema";
import Relation from "./Relation";

export default class Model extends Relation {
  protected static $connection: string;
  protected static $databaseName: string;
  protected static $collection: string;
  protected static $useSoftDelete: boolean = false;
  protected static $useTimestamps: boolean = true;

  public static async insert<M extends typeof Model>(
    this: M,
    doc: FormSchema<M["$schema"]>,
    options?: InsertOneOptions
  ) {
    return this.query().insert(doc, options);
  }

  public static async create<M extends typeof Model>(
    this: M,
    doc: FormSchema<M["$schema"]>,
    options?: InsertOneOptions
  ) {
    return this.query().insert(doc, options);
  }

  public static async insertMany<M extends typeof Model>(
    this: M,
    docs: FormSchema<M["$schema"]>[],
    options?: BulkWriteOptions
  ): Promise<ObjectId[]> {
    return this.query().insertMany(docs, options);
  }

  public static async update<M extends typeof Model>(
    this: M,
    doc: Partial<FormSchema<M["$schema"]>>,
    options: FindOneAndUpdateOptions = {}
  ) {
    return this.query().update(doc, options);
  }

  public static async updateOrCreate<M extends typeof Model>(
    this: M,
    filter: { [key: string]: any },
    doc: Partial<FormSchema<M["$schema"]>>
  ) {
    return this.query().updateOrCreate(filter, doc);
  }

  public static async updateMany<M extends typeof Model>(
    this: M,
    doc: Partial<FormSchema<M["$schema"]>>,
    options?: UpdateOptions
  ): Promise<number> {
    return this.query().updateMany(doc, options);
  }

  public static async destroy(
    ids: string | string[] | ObjectId | ObjectId[]
  ): Promise<number> {
    return this.query().destroy(ids);
  }

  public static async delete(): Promise<number> {
    return this.query().delete();
  }

  public static select(columns: string | string[]) {
    return this.query().select(columns);
  }

  public static exclude(columns: string | string[]) {
    return this.query().exclude(columns);
  }

  public static where(column: string, operator: any, value: any = null) {
    return this.query().where(column, operator, value);
  }

  public static orWhere(column: string, operator: any, value: any = null) {
    return this.query().orWhere(column, operator, value);
  }

  public static whereNot(column: string, value: any) {
    return this.query().whereNot(column, value);
  }

  public static orWhereNot(column: string, value: any) {
    return this.query().whereNot(column, value);
  }

  public static whereIn(column: string, values: any[]) {
    return this.query().whereIn(column, values);
  }

  public static orWhereIn(column: string, values: any[]) {
    return this.query().orWhereIn(column, values);
  }

  public static whereNotIn(column: string, values: any[]) {
    return this.query().whereNotIn(column, values);
  }

  public static orWhereNotIn(column: string, values: any[]) {
    return this.query().orWhereNotIn(column, values);
  }

  public static whereBetween(column: string, values: [number, number?]) {
    return this.query().whereBetween(column, values);
  }

  public static orWhereBetween(column: string, values: [number, number?]) {
    return this.query().orWhereBetween(column, values);
  }

  public static whereNull(column: string) {
    return this.query().whereNull(column);
  }

  public static OrWhereNull(column: string) {
    return this.query().OrWhereNull(column);
  }

  public static whereNotNull(column: string) {
    return this.query().whereNotNull(column);
  }

  public static orWhereNotNull(column: string) {
    return this.query().orWhereNotNull(column);
  }

  public static withTrashed() {
    return this.query().withTrashed();
  }

  public static onlyTrashed() {
    return this.query().onlyTrashed();
  }

  public static offset(value: number) {
    return this.query().offset(value);
  }

  public static skip(value: number) {
    return this.query().skip(value);
  }

  public static limit(value: number) {
    return this.query().limit(value);
  }

  public static take(value: number) {
    return this.query().take(value);
  }

  public static forPage(page: number, limit: number = 15) {
    return this.query().forPage(page, limit);
  }

  public static orderBy(
    column: string,
    order: string = "asc",
    caseSensitive: boolean = false
  ) {
    return this.query().orderBy(column, order, caseSensitive);
  }

  public static groupBy(column: string) {
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

  public static async firstOrCreate<M extends typeof Model>(
    this: M,
    doc: FormSchema<M["$schema"]>
  ) {
    return this.query().firstOrCreate(doc);
  }

  public static async pluck<M extends typeof Model>(
    this: M,
    keys: keyof M["$schema"] | (keyof M["$schema"])[]
  ) {
    return this.query().pluck(keys as any);
  }

  public static async count(): Promise<number> {
    return this.query().count();
  }

  public static async max(column: string): Promise<number> {
    return this.query().max(column);
  }

  public static async min(column: string): Promise<number> {
    return this.query().min(column);
  }

  public static async avg(column: string): Promise<number> {
    return this.query().avg(column);
  }

  public static async sum(column: string): Promise<number> {
    return this.query().sum(column);
  }

  private static query<M extends typeof Model>(this: M) {
    return new this({
      connection: this.$connection,
      databaseName: this.$databaseName,
      collection: this.$collection || `${this.name.toLowerCase()}s`,
      useSoftDelete: this.$useSoftDelete,
      useTimestamps: this.$useTimestamps,
    });
  }
}

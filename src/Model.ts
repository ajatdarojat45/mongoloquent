import QueryBuilder from "./QueryBuilder";
import { ObjectId } from "mongodb";

export default class Model {
  protected static $connection: string;
  protected static $databaseName: string;
  protected static $collection: string;
  protected static $useSoftDelete: boolean = false;
  protected static $useTimestamps: boolean = true;

  public static select(columns: string | string[]): QueryBuilder {
    const builder = this.build();
    builder.select(columns);

    return builder;
  }

  public static exclude(columns: string | string[]): QueryBuilder {
    const builder = this.build();
    builder.exclude(columns);

    return builder;
  }

  public static where(
    column: string,
    operator: any,
    value: any = null
  ): QueryBuilder {
    const builder = this.build();
    builder.where(column, operator, value);

    return builder;
  }

  public static orWhere(column: string, operator: any, value: any = null) {
    const builder = this.build();
    builder.orWhere(column, operator, value);

    return builder;
  }

  public static whereNot(column: string, value: any): QueryBuilder {
    const builder = this.build();
    builder.whereNot(column, value);

    return builder;
  }

  public static orWhereNot(column: string, value: any): QueryBuilder {
    const builder = this.build();
    builder.whereNot(column, value);

    return builder;
  }

  public static whereIn(column: string, values: any[]): QueryBuilder {
    const builder = this.build();
    builder.whereIn(column, values);

    return builder;
  }

  public static orWhereIn(column: string, values: any[]): QueryBuilder {
    const builder = this.build();
    builder.orWhereIn(column, values);

    return builder;
  }

  public static whereNotIn(column: string, values: any[]): QueryBuilder {
    const builder = this.build();
    builder.whereNotIn(column, values);

    return builder;
  }

  public static orWhereNotIn(column: string, values: any[]): QueryBuilder {
    const builder = this.build();
    builder.orWhereNotIn(column, values);

    return builder;
  }

  public static whereBetween(
    column: string,
    values: [number, number?]
  ): QueryBuilder {
    const builder = this.build();
    builder.whereBetween(column, values);

    return builder;
  }

  public static orWhereBetween(
    column: string,
    values: [number, number?]
  ): QueryBuilder {
    const builder = this.build();
    builder.orWhereBetween(column, values);

    return builder;
  }

  public static whereNull(column: string): QueryBuilder {
    const builder = this.build();
    builder.whereNull(column);

    return builder;
  }

  public static OrWhereNull(column: string): QueryBuilder {
    const builder = this.build();
    builder.OrWhereNull(column);

    return builder;
  }

  public static whereNotNull(column: string): QueryBuilder {
    const builder = this.build();
    builder.whereNotNull(column);

    return builder;
  }

  public static orWhereNotNull(column: string): QueryBuilder {
    const builder = this.build();
    builder.orWhereNotNull(column);

    return builder;
  }

  public static withTrashed(): QueryBuilder {
    const builder = this.build();
    builder.withTrashed();

    return builder;
  }

  public static onlyTrashed(): QueryBuilder {
    const builder = this.build();
    builder.onlyTrashed();

    return builder;
  }

  public static offset(value: number): QueryBuilder {
    const builder = this.build();
    builder.offset(value);

    return builder;
  }

  public static skip(value: number): QueryBuilder {
    const builder = this.build();
    builder.skip(value);

    return builder;
  }

  public static limit(value: number): QueryBuilder {
    const builder = this.build();
    builder.limit(value);

    return builder;
  }

  public static take(value: number): QueryBuilder {
    const builder = this.build();
    builder.take(value);

    return builder;
  }

  public static forPage(page: number, limit: number = 15): QueryBuilder {
    const builder = this.build();
    builder.forPage(page, limit);

    return builder;
  }

  public static orderBy(
    column: string,
    order: string = "asc",
    isSensitive: boolean = false
  ): QueryBuilder {
    const builder = this.build();
    builder.orderBy(column, order, isSensitive);

    return builder;
  }

  public static groupBy(column: string): QueryBuilder {
    const builder = this.build();
    builder.groupBy(column);

    return builder;
  }

  public static async find(id: string | ObjectId) {
    const builder = this.build()
    await builder.find(id)

    return builder
  }

  public static async all() {
    const builder = this.build();
    const data = await builder.all();

    return data;
  }

  public static async get(columns: string | string[] = []) {
    const builder = this.build();
    const data = await builder.get(columns);

    return data;
  }

  public static async first(columns: string | string[] = []) {
    const builder = this.build();
    const data = await builder.first(columns);

    return data;
  }

  private static build(): QueryBuilder {
    const builder = new QueryBuilder({
      connection: this.$connection,
      databaseName: this.$databaseName,
      collection: this.$collection || `${this.name.toLowerCase()}s`,
      useSoftDelete: this.$useSoftDelete,
      useTimestamps: this.$useTimestamps,
    });
    return builder;
  }
}

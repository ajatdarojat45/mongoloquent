import { BulkWriteOptions, InsertOneOptions, ObjectId } from "mongodb";
import Relation from "./Relation";
import { FormSchema } from "./types/schema";
import { IRelationTypes } from "./interfaces/IRelation";

export default class Model<T> extends Relation<T> {
  [key: string]: any;

  constructor() {
    super();
    return new Proxy(this, {
      set: (target, prop, value) => {
        // @ts-ignore
        // prop ! starts with $ means it's a private property
        if (!prop.startsWith("$") && value !== target.$original[prop]) {
          // @ts-ignore
          target.$changes[prop] = value;
        }

        // @ts-ignore
        target[prop] = value;
        return true;
      },
    });
  }

  public static async insert<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>,
    options?: InsertOneOptions
  ) {
    return this.query().insert(doc, options);
  }

  public static async create<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>,
    options?: InsertOneOptions
  ) {
    return this.query().create(doc, options);
  }

  public static async insertMany<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>[],
    options?: BulkWriteOptions
  ) {
    return this.query().insertMany(doc, options);
  }

  public static async createMany<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>[],
    options?: BulkWriteOptions
  ) {
    return this.query().createMany(doc, options);
  }

  public static async updateOrCreate<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc: Partial<FormSchema<M["$schema"]>>
  ) {
    return this.query().updateOrCreate(filter, doc);
  }

  public static async updateOrInsert<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc: Partial<FormSchema<M["$schema"]>>
  ) {
    return this.query().updateOrInsert(filter, doc);
  }

  public static destroy<M extends typeof Model<any>>(
    this: M,
    ...ids: (string | ObjectId)[]
  ) {
    return this.query().destroy(...ids);
  }

  public static forceDestroy<M extends typeof Model<any>>(
    this: M,
    ...ids: (string | ObjectId)[]
  ) {
    return this.query().forceDestroy(...ids);
  }

  public static select<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().select(...fields);
  }

  public static exclude<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().exclude(...fields);
  }

  static where<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    operator: any,
    value: any = null
  ) {
    return this.query().where(column, operator, value);
  }

  static orWhere<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    operator: any,
    value: any = null
  ) {
    return this.query().orWhere(column, operator, value);
  }

  static whereNot<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any
  ) {
    return this.query().whereNot(column, value);
  }

  static orWhereNot<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any
  ) {
    return this.query().orWhereNot(column, value);
  }

  static whereIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[]
  ) {
    return this.query().whereIn(column, value);
  }

  static orWhereIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[]
  ) {
    return this.query().orWhereIn(column, value);
  }

  static whereNotIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[]
  ) {
    return this.query().whereNotIn(column, value);
  }

  static orWhereNotIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[]
  ) {
    return this.query().orWhereNotIn(column, value);
  }

  static whereBetween<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: [number, number?]
  ) {
    return this.query().whereBetween(column, value);
  }

  static orWhereBetween<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: [number, number?]
  ) {
    return this.query().orWhereBetween(column, value);
  }

  static whereNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"]
  ) {
    return this.query().whereNull(column);
  }

  static orWhereNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"]
  ) {
    return this.query().orWhereNull(column);
  }

  static whereNotNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"]
  ) {
    return this.query().whereNotNull(column);
  }

  static orWhereNotNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"]
  ) {
    return this.query().orWhereNotNull(column);
  }

  static withTrashed<M extends typeof Model<any>>(this: M) {
    return this.query().withTrashed();
  }

  static onlyTrashed<M extends typeof Model<any>>(this: M) {
    return this.query().onlyTrashed();
  }

  static offset<M extends typeof Model<any>>(this: M, value: number) {
    return this.query().offset(value);
  }

  static skip<M extends typeof Model<any>>(this: M, value: number) {
    return this.query().skip(value);
  }

  static orderBy<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    direction: "asc" | "desc" = "asc",
    caseSensitive: boolean = false
  ) {
    return this.query().orderBy(column, direction, caseSensitive);
  }

  static limit<M extends typeof Model<any>>(this: M, value: number) {
    return this.query().limit(value);
  }

  static get<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().get(...fields);
  }

  static all<M extends typeof Model<any>>(this: M) {
    return this.query().all();
  }

  static paginate<M extends typeof Model<any>>(
    this: M,
    page: number = 1,
    limit?: number
  ) {
    return this.query().paginate(page, limit);
  }

  static first<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().first(...fields);
  }

  static firstOrCreate<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc: Partial<FormSchema<M["$schema"]>>
  ) {
    return this.query().firstOrCreate(filter, doc);
  }

  static firstOrNew<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc: Partial<FormSchema<M["$schema"]>>
  ) {
    return this.query().firstOrNew(filter, doc);
  }

  // static find<M extends typeof Model<any>>(this: M, id: string | ObjectId) {
  //   return this.query().find(id);
  // }

  static find<M extends typeof Model<any>>(
    this: M,
    id: string | ObjectId
  ): Promise<InstanceType<M>> {
    return this.query().find(id) as Promise<InstanceType<M>>;
  }

  static count<M extends typeof Model<any>>(this: M) {
    return this.query().count();
  }

  static max<M extends typeof Model<any>>(this: M, column: keyof M["$schema"]) {
    return this.query().max(column);
  }

  static min<M extends typeof Model<any>>(this: M, column: keyof M["$schema"]) {
    return this.query().min(column);
  }

  static avg<M extends typeof Model<any>>(this: M, column: keyof M["$schema"]) {
    return this.query().avg(column);
  }

  static sum<M extends typeof Model<any>>(this: M, column: keyof M["$schema"]) {
    return this.query().sum(column);
  }

  static query<M extends typeof Model<any>>(this: M): Model<M["$schema"]> {
    return new this();
  }

  hasMany<M>(
    model: new () => Model<M>,
    foreignKey: keyof M,
    localKey: keyof T
  ): Model<M> {
    const relation = new model();
    const parent = this;
    // relation.where(foreignKey, this[localKey as string]);

    return relation;
  }
}

interface IUser {
  _id: ObjectId;
  name: string;
  age: number;
}

interface IPost {
  _id: ObjectId;
  title: string;
  content: string;
  userId: ObjectId;
}

class Post extends Model<IPost> {
  static $schema: IPost;
}

class User extends Model<IUser> {
  static $schema: IUser;

  posts() {
    return this.hasMany(Post, "userId", "_id");
  }
}

(async () => {
  const user = await User.find("67b9c25b804f1a0ebdb3d4f4");
  const posts = await user.posts().get();
})();

import Relation from "./Relation";

export default class Model<T> extends Relation<T> {
  [key: string]: any;

  constructor() {
    super();
    const schema = (this.constructor as any).$schema;
    if (schema) {
      this.$original = { ...schema };
      Object.assign(this, schema);
      return this.createProxy();
    }
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

  static get<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().get(...fields);
  }

  static first<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().first(...fields);
  }

  static query<M extends typeof Model<any>>(this: M): Model<M["$schema"]> {
    return new this();
  }
}

interface IUser {
  _id: string;
  name: string;
  age: number;
}

class User extends Model<IUser> {
  static $schema: IUser;
}

(async () => {
  const user = await User.first();

  console.log(user);
  // const Udin = new User();
  // Udin.name = "Udin";
  // console.log(Udin);
})();

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

  static get<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().get(...fields);
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
  static $schema = {
    name: "string",
    age: "string",
    _id: "string",
  };
}

(async () => {
  const user = await User.exclude("age").first();
})();

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

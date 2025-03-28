import QueryBuilder from "./QueryBuilder";
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
    field: keyof M["$schema"]
  ): QueryBuilder<M["$schema"]> {
    return this.query().where(field);
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
    return this.query().first(...fields) as Promise<
      Model<M["$schema"]> & M["$schema"]
    >;
  }

  static query<M extends typeof Model<any>>(this: M): Model<M["$schema"]> {
    return new this();
  }
}

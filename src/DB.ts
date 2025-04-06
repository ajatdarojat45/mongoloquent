import QueryBuilder from "./QueryBuilder";

export default class DB<T> extends QueryBuilder<T> {
  [key: string]: any;

  constructor() {
    super();
  }

  static collection<T>(this: new () => DB<T>, collection: string): DB<T> {
    const q = new this();
    q["$collection"] = collection;

    return q;
  }
}

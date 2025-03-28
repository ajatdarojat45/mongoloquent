import QueryBuilder from "./QueryBuilder";
import Relation from "./Relation";

export default class Model<T> extends Relation<T> {
  [key: string]: any;

  constructor() {
    super();

    // Initialize from schema
    const schema = (this.constructor as any).$schema;
    if (schema) {
      // Save original values
      this.$original = { ...schema };

      // Add schema properties to instance
      Object.assign(this, schema);

      // Create and return proxy
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

interface UserSchema {
  name: string;
  email: string;
}

class User extends Model<UserSchema> {
  static $schema: UserSchema = {
    name: "",
    email: "",
  };
}

(async () => {
  const user = await User.where("name").first();
  user.name = "John Doe";
  // console.log(user.getChanges());

  const Udin = new User();
  Udin.name = "Udin";
  console.log(Udin);
})();

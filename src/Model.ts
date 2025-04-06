import { BulkWriteOptions, InsertOneOptions, ObjectId } from "mongodb";
import Relation from "./Relation";
import { FormSchema } from "./types/schema";
import {
  IRelationOptions,
  IRelationTypes,
  IRelationHasMany,
  IRelationBelongsTo,
  IRelationHasOne,
  IRelationHasManyThrough,
  IRelationBelongsToMany,
  IRelationMorphMany,
  IRelationMorphTo,
  IRelationMorphToMany,
  IRelationMorphedByMany,
} from "./interfaces/IRelation";
import HasMany from "./relations/HasMany";
import BelongsTo from "./relations/BelongsTo";
import HasOne from "./relations/HasOne";
import HasManyThrough from "./relations/HasManyThrough";
import BelongsToMany from "./relations/BelongsToMany";
import MorphMany from "./relations/MorphMany";
import MorphTo from "./relations/MorphTo";
import MorphToMany from "./relations/MorphToMany";
import MorphedByMany from "./relations/MorphedByMany";

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

  static with<M extends typeof Model<any>>(
    this: M,
    relation: string,
    options: IRelationOptions = {}
  ) {
    const model = this.query();
    model.$alias = relation;
    model.$options = options;
    model[relation]();

    return model;
  }

  with(relation: string, options: IRelationOptions = {}) {
    this.$alias = relation;
    this.$options = options;
    this[relation]();

    return this;
  }

  hasMany<M>(
    model: new () => Model<M>,
    foreignKey: keyof M,
    localKey: keyof T
  ) {
    const relation = new model();

    const hasMany: IRelationHasMany = {
      type: IRelationTypes.hasMany,
      model: this,
      relatedModel: relation,
      foreignKey: foreignKey as string,
      localKey: localKey as string,
      alias: this.$alias,
      options: this.$options,
    };
    this.setRelationship(hasMany);
    const lookups = HasMany.generate(hasMany);
    this.$lookups = [...this.$lookups, ...lookups];

    return new HasMany<T, M>(this, relation, foreignKey, localKey);
  }

  hasOne<M>(
    model: new () => Model<M>,
    foreignKey: keyof M,
    localKey: keyof T
  ): Model<M> {
    const relation = new model();

    const hasOne: IRelationHasOne = {
      type: IRelationTypes.hasOne,
      model: this,
      relatedModel: relation,
      foreignKey: foreignKey as string,
      localKey: localKey as string,
      alias: this.$alias,
      options: this.$options,
    };
    this.setRelationship(hasOne);
    const lookups = HasOne.generate(hasOne);
    this.$lookups = [...this.$lookups, ...lookups];

    relation.setRelationship({
      type: IRelationTypes.hasMany,
      model: relation,
      relatedModel: this,
      foreignKey: foreignKey as string,
      localKey: localKey as string,
      alias: "",
      options: {},
    });
    return relation;
  }

  belongsTo<M>(
    model: new () => Model<M>,
    foreignKey: keyof T,
    ownerKey: keyof M
  ) {
    const relation = new model();

    const belongsTo: IRelationBelongsTo = {
      type: IRelationTypes.belongsTo,
      model: this,
      relatedModel: relation,
      foreignKey: foreignKey as string,
      ownerKey: ownerKey as string,
      alias: this.$alias,
      options: this.$options,
    };
    this.setRelationship(belongsTo);
    const lookupsBelongsTo = BelongsTo.generate(belongsTo);
    this.$lookups = [...this.$lookups, ...lookupsBelongsTo];

    return new BelongsTo<T, M>(this, relation, foreignKey, ownerKey);
  }

  hasManyThrough<M, TM>(
    model: new () => Model<M>,
    throughModel: new () => Model<TM>,
    foreignKey: keyof TM,
    foreignKeyThrough: keyof M,
    localKey: keyof T = "_id" as keyof T,
    localKeyThrough: keyof TM = "_id" as keyof TM
  ) {
    const relation = new model();
    const through = new throughModel();

    const hasManyThrough: IRelationHasManyThrough = {
      type: IRelationTypes.hasManyThrough,
      model: this,
      relatedModel: relation,
      throughModel: through,
      foreignKey: foreignKey as string,
      foreignKeyThrough: foreignKeyThrough as string,
      localKey: localKey as string,
      localKeyThrough: localKeyThrough as string,
      alias: this.$alias,
      options: this.$options,
    };
    this.setRelationship(hasManyThrough);
    const lookups = HasManyThrough.generate(hasManyThrough);
    this.$lookups = [...this.$lookups, ...lookups];

    return new HasManyThrough<T, M, TM>(
      this,
      relation,
      through,
      foreignKey,
      foreignKeyThrough,
      localKey,
      localKeyThrough
    );
  }

  belongsToMany<M, TM>(
    model: new () => Model<M>,
    pivotModel: new () => Model<TM>,
    foreignPivotKey: keyof TM,
    relatedPivotKey: keyof TM,
    parentKey: keyof T,
    relatedKey: keyof M
  ) {
    const relation = new model();
    const pivot = new pivotModel();
    const belongsToMany: IRelationBelongsToMany = {
      type: IRelationTypes.belongsToMany,
      model: this,
      relatedModel: relation,
      pivotModel: pivot,
      foreignPivotKey: foreignPivotKey as string,
      relatedPivotKey: relatedPivotKey as string,
      parentKey: parentKey as string,
      relatedKey: relatedKey as string,
      alias: this.$alias,
      options: this.$options,
    };
    const lookups = BelongsToMany.generate(belongsToMany);
    this.$lookups = [...this.$lookups, ...lookups];

    return new BelongsToMany<T, M, TM>(
      this,
      relation,
      pivot,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey
    );
  }

  morphMany<M>(model: new () => Model<M>, name: string) {
    const relation = new model();

    const morphMany: IRelationMorphMany = {
      type: IRelationTypes.morphMany,
      model: this,
      relatedModel: relation,
      morph: name,
      morphId: `${name}Id`,
      morphType: `${name}Type`,
      alias: this.$alias,
      options: this.$options,
    };
    const lookups = MorphMany.generate(morphMany);
    this.$lookups = [...this.$lookups, ...lookups];

    return new MorphMany<T, M>(
      this,
      relation,
      name,
      `${name}Id`,
      `${name}Type`
    );
  }

  morphTo<M>(model: new () => Model<M>, name: string) {
    const relation = new model();

    const morphTo: IRelationMorphTo = {
      type: IRelationTypes.morphTo,
      model: this,
      relatedModel: relation,
      morph: name,
      morphId: `${name}Id`,
      morphType: `${name}Type`,
      morphCollectionName: `${name}s`,
      alias: this.$alias,
      options: this.$options,
    };
    this.setRelationship(morphTo);
    const lookups = MorphTo.generate(morphTo);
    this.$lookups = [...this.$lookups, ...lookups];

    relation.setRelationship({
      type: IRelationTypes.morphTo,
      model: relation,
      relatedModel: this,
      morph: name,
      morphId: `${name}Id`,
      morphType: `${name}Type`,
      morphCollectionName: `${name}s`,
      alias: "",
      options: {},
    });
    return relation;
  }

  morphToMany<M>(model: new () => Model<M>, name: string) {
    const relation = new model();

    const morphToMany: IRelationMorphToMany = {
      type: IRelationTypes.morphToMany,
      model: this,
      relatedModel: relation,
      morph: name,
      morphId: `${name}Id`,
      morphType: `${name}Type`,
      morphCollectionName: `${name}s`,
      alias: this.$alias,
      options: this.$options,
    };
    const lookups = MorphToMany.generate(morphToMany);
    this.$lookups = [...this.$lookups, ...lookups];

    return new MorphToMany<T, M>(
      this,
      relation,
      name,
      `${name}Id`,
      `${name}Type`,
      `${name}s`
    );
  }

  morphedByMany<M>(model: new () => Model<M>, name: string): Model<M> {
    const relation = new model();

    const morphedByMany: IRelationMorphedByMany = {
      type: IRelationTypes.morphedByMany,
      model: this,
      relatedModel: relation,
      morph: name,
      morphId: `${name}Id`,
      morphType: `${name}Type`,
      morphCollectionName: `${name}s`,
      alias: this.$alias,
      options: this.$options,
    };
    const lookups = MorphedByMany.generate(morphedByMany);
    this.$lookups = [...this.$lookups, ...lookups];

    relation.setRelationship({
      type: IRelationTypes.morphedByMany,
      model: relation,
      relatedModel: this,
      morph: name,
      morphId: `${name}Id`,
      morphType: `${name}Type`,
      morphCollectionName: `${name}s`,
      alias: "",
      options: {},
    });
    return relation;
  }
}

interface IPost {
  _id: ObjectId;
  title: string;
  body: string;
}

interface ITag {
  _id: ObjectId;
  name: string;
}

interface IVideo {
  _id: ObjectId;
  title: string;
  url: string;
}

class Post extends Model<IPost> {
  static $schema: IPost;

  public tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Video extends Model<IVideo> {
  static $schema: IVideo;

  public tags() {
    return this.morphToMany(Tag, "taggable");
  }
}

class Tag extends Model<ITag> {
  static $schema: ITag;
}

(async () => {
  const videos = await Video.find("67ed4054497784cac07774cc");
  const tags = await videos
    .tags()
    .attach(["67edbfa0497784cac07774dd", "67edbfa0497784cac07774de"]);
  console.log(tags);
})();

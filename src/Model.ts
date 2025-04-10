import { BulkWriteOptions, InsertOneOptions, ObjectId } from "mongodb";

import DB from "./DB";
import QueryBuilder from "./QueryBuilder";
import {
  IRelationBelongsTo,
  IRelationBelongsToMany,
  IRelationHasMany,
  IRelationHasManyThrough,
  IRelationHasOne,
  IRelationMorphMany,
  IRelationMorphTo,
  IRelationMorphToMany,
  IRelationMorphedByMany,
  IRelationOptions,
  IRelationTypes,
} from "./interfaces/IRelation";
import BelongsTo from "./relations/BelongsTo";
import BelongsToMany from "./relations/BelongsToMany";
import HasMany from "./relations/HasMany";
import HasManyThrough from "./relations/HasManyThrough";
import HasOne from "./relations/HasOne";
import MorphMany from "./relations/MorphMany";
import MorphTo from "./relations/MorphTo";
import MorphToMany from "./relations/MorphToMany";
import MorphedByMany from "./relations/MorphedByMany";
import { FormSchema } from "./types/schema";

/**
 * Base model class for all MongoDB models
 * Extends QueryBuilder to provide query building capabilities
 * @template T Type of the model schema
 */
export default class Model<T> extends QueryBuilder<T> {
  /**
   * Dynamic property accessor for model attributes
   */
  [key: string]: any;

  /**
   * Creates a new model instance with a proxy to track property changes
   */
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

  /**
   * Inserts a new document into the collection
   * @template M Type of the model class
   * @param {FormSchema<M["$schema"]>} doc Document to insert
   * @param {InsertOneOptions} [options] MongoDB insert options
   * @returns {Promise<any>} Inserted document
   */
  public static async insert<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>,
    options?: InsertOneOptions,
  ) {
    return this.query().insert(doc, options);
  }

  /**
   * Creates a new document in the collection
   * @template M Type of the model class
   * @param {FormSchema<M["$schema"]>} doc Document to create
   * @param {InsertOneOptions} [options] MongoDB insert options
   * @returns {Promise<any>} Created document
   */
  public static async create<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>,
    options?: InsertOneOptions,
  ) {
    return this.query().create(doc, options);
  }

  /**
   * Inserts multiple documents into the collection
   * @template M Type of the model class
   * @param {FormSchema<M["$schema"]>[]} doc Documents to insert
   * @param {BulkWriteOptions} [options] MongoDB bulk write options
   * @returns {Promise<any>} Inserted documents
   */
  public static async insertMany<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>[],
    options?: BulkWriteOptions,
  ) {
    return this.query().insertMany(doc, options);
  }

  /**
   * Creates multiple documents in the collection
   * @template M Type of the model class
   * @param {FormSchema<M["$schema"]>[]} doc Documents to create
   * @param {BulkWriteOptions} [options] MongoDB bulk write options
   * @returns {Promise<any>} Created documents
   */
  public static async createMany<M extends typeof Model<any>>(
    this: M,
    doc: FormSchema<M["$schema"]>[],
    options?: BulkWriteOptions,
  ) {
    return this.query().createMany(doc, options);
  }

  /**
   * Updates a document or creates it if it doesn't exist
   * @template M Type of the model class
   * @param {Partial<M["$schema"]>} filter Filter to find document
   * @param {Partial<FormSchema<M["$schema"]>>} doc Document to update or create
   * @returns {Promise<any>} Updated or created document
   */
  public static async updateOrCreate<M extends typeof Model<any>>(
    this: M,
    filter: Partial<FormSchema<M["$schema"]>>,
    doc?: Partial<FormSchema<M["$schema"]>>,
  ) {
    return this.query().updateOrCreate(filter, doc);
  }

  /**
   * Updates a document or inserts it if it doesn't exist
   * @template M Type of the model class
   * @param {Partial<M["$schema"]>} filter Filter to find document
   * @param {Partial<FormSchema<M["$schema"]>>} doc Document to update or insert
   * @returns {Promise<any>} Updated or inserted document
   */
  public static async updateOrInsert<M extends typeof Model<any>>(
    this: M,
    filter: Partial<FormSchema<M["$schema"]>>,
    doc?: Partial<FormSchema<M["$schema"]>>,
  ) {
    return this.query().updateOrInsert(filter, doc);
  }

  /**
   * Soft deletes documents by their IDs
   * @template M Type of the model class
   * @param {...(string | ObjectId)[]} ids IDs of documents to delete
   * @returns {Promise<any>} Result of the delete operation
   */
  public static destroy<M extends typeof Model<any>>(
    this: M,
    ...ids: (string | ObjectId | (string | ObjectId)[])[]
  ) {
    const flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
      return acc.concat(Array.isArray(id) ? id : [id]);
    }, []);

    return this.query().destroy(...flattenedIds);
  }

  /**
   * Hard deletes documents by their IDs
   * @template M Type of the model class
   * @param {...(string | ObjectId)[]} ids IDs of documents to delete
   * @returns {Promise<any>} Result of the delete operation
   */
  public static forceDestroy<M extends typeof Model<any>>(
    this: M,
    ...ids: (string | ObjectId | (string | ObjectId)[])[]
  ) {
    const flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
      return acc.concat(Array.isArray(id) ? id : [id]);
    }, []);
    return this.query().forceDestroy(...flattenedIds);
  }

  /**
   * Selects specific fields from the documents
   * @template M Type of the model class
   * @param {...(keyof M["$schema"] | Array<keyof M["$schema"]>)[]} fields Fields to select
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static select<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().select(...fields);
  }

  /**
   * Excludes specific fields from the documents
   * @template M Type of the model class
   * @param {...(keyof M["$schema"] | Array<keyof M["$schema"]>)[]} fields Fields to exclude
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static exclude<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().exclude(...fields);
  }

  /**
   * Adds a where clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any} operator Operator or value
   * @param {any} [value=null] Value if operator is provided
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static where<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    operator: any,
    value: any = null,
  ) {
    return this.query().where(column, operator, value);
  }

  /**
   * Adds an OR where clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any} operator Operator or value
   * @param {any} [value=null] Value if operator is provided
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orWhere<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    operator: any,
    value: any = null,
  ) {
    return this.query().orWhere(column, operator, value);
  }

  /**
   * Adds a where not clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any} value Value to exclude
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static whereNot<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any,
  ) {
    return this.query().whereNot(column, value);
  }

  /**
   * Adds an OR where not clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any} value Value to exclude
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orWhereNot<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any,
  ) {
    return this.query().orWhereNot(column, value);
  }

  /**
   * Adds a where in clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any[]} value Array of values to include
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static whereIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[],
  ) {
    return this.query().whereIn(column, value);
  }

  /**
   * Adds an OR where in clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any[]} value Array of values to include
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orWhereIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[],
  ) {
    return this.query().orWhereIn(column, value);
  }

  /**
   * Adds a where not in clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any[]} value Array of values to exclude
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static whereNotIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[],
  ) {
    return this.query().whereNotIn(column, value);
  }

  /**
   * Adds an OR where not in clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {any[]} value Array of values to exclude
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orWhereNotIn<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: any[],
  ) {
    return this.query().orWhereNotIn(column, value);
  }

  /**
   * Adds a where between clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {[number, number?]} value Range values [min, max]
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static whereBetween<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: [number, number?],
  ) {
    return this.query().whereBetween(column, value);
  }

  /**
   * Adds an OR where between clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to filter on
   * @param {[number, number?]} value Range values [min, max]
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orWhereBetween<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    value: [number, number?],
  ) {
    return this.query().orWhereBetween(column, value);
  }

  /**
   * Adds a where null clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to check for null
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static whereNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().whereNull(column);
  }

  /**
   * Adds an OR where null clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to check for null
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orWhereNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().orWhereNull(column);
  }

  /**
   * Adds a where not null clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to check for not null
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static whereNotNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().whereNotNull(column);
  }

  /**
   * Adds an OR where not null clause to the query
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to check for not null
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orWhereNotNull<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().orWhereNotNull(column);
  }

  /**
   * Includes soft deleted documents in the query
   * @template M Type of the model class
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static withTrashed<M extends typeof Model<any>>(this: M) {
    return this.query().withTrashed();
  }

  /**
   * Only includes soft deleted documents in the query
   * @template M Type of the model class
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static onlyTrashed<M extends typeof Model<any>>(this: M) {
    return this.query().onlyTrashed();
  }

  /**
   * Sets the offset for the query
   * @template M Type of the model class
   * @param {number} value Number of documents to skip
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static offset<M extends typeof Model<any>>(this: M, value: number) {
    return this.query().offset(value);
  }

  /**
   * Sets the number of documents to skip
   * @template M Type of the model class
   * @param {number} value Number of documents to skip
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static skip<M extends typeof Model<any>>(this: M, value: number) {
    return this.query().skip(value);
  }

  /**
   * Sets the order for the query results
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to sort by
   * @param {"asc"|"desc"} direction Sort direction
   * @param {boolean} caseSensitive Whether to use case sensitive sorting
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static orderBy<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
    direction: "asc" | "desc" = "asc",
    caseSensitive: boolean = false,
  ) {
    return this.query().orderBy(column, direction, caseSensitive);
  }

  /**
   * Sets the limit for the query
   * @template M Type of the model class
   * @param {number} value Maximum number of documents to return
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static limit<M extends typeof Model<any>>(this: M, value: number) {
    return this.query().limit(value);
  }

  public static take<M extends typeof Model<any>>(this: M, value: number) {
    return this.query().limit(value);
  }

  /**
   * Executes the query and returns the documents
   * @template M Type of the model class
   * @param {...(keyof M["$schema"] | Array<keyof M["$schema"]>)[]} fields Fields to select
   * @returns {Promise<any[]>} Retrieved documents
   */
  public static get<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().get(...fields);
  }

  /**
   * Gets all documents from the collection
   * @template M Type of the model class
   * @returns {Promise<any[]>} All documents
   */
  public static all<M extends typeof Model<any>>(this: M) {
    return this.query().all();
  }

  public static async pluck<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().pluck(...fields);
  }

  /**
   * Gets paginated results from the query
   * @template M Type of the model class
   * @param {number} page Page number
   * @param {number} [limit] Documents per page
   * @returns {Promise<{data: any[], meta: any}>} Paginated results and metadata
   */
  public static paginate<M extends typeof Model<any>>(
    this: M,
    page: number = 1,
    limit: number = 15,
  ) {
    return this.query().paginate(page, limit);
  }

  /**
   * Gets the first document matching the query
   * @template M Type of the model class
   * @param {...(keyof M["$schema"] | Array<keyof M["$schema"]>)[]} fields Fields to select
   * @returns {Promise<any>} First matching document
   */
  public static first<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().first(...fields);
  }

  /**
   * Gets the first document matching the filter or creates it
   * @template M Type of the model class
   * @param {Partial<M["$schema"]>} filter Filter to find the document
   * @param {Partial<FormSchema<M["$schema"]>>} doc Document to create if not found
   * @returns {Promise<any>} Retrieved or created document
   */
  public static firstOrCreate<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc?: Partial<FormSchema<M["$schema"]>>,
  ) {
    return this.query().firstOrCreate(filter, doc);
  }

  /**
   * Gets the first document matching the filter or returns a new model instance
   * @template M Type of the model class
   * @param {Partial<M["$schema"]>} filter Filter to find the document
   * @param {Partial<FormSchema<M["$schema"]>>} doc Document properties for the new instance
   * @returns {Promise<any>} Retrieved document or new instance
   */
  public static firstOrNew<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc?: Partial<FormSchema<M["$schema"]>>,
  ) {
    return this.query().firstOrNew(filter, doc);
  }

  /**
   * Finds a document by its ID
   * @template M Type of the model class
   * @param {string|ObjectId} id Document ID
   * @returns {Promise<InstanceType<M>>} Retrieved document as model instance
   */
  public static find<M extends typeof Model<any>>(
    this: M,
    id: string | ObjectId,
  ): Promise<InstanceType<M>> {
    return this.query().find(id) as Promise<InstanceType<M>>;
  }

  /**
   * Counts documents matching the query
   * @template M Type of the model class
   * @returns {Promise<number>} Document count
   */
  public static count<M extends typeof Model<any>>(this: M) {
    return this.query().count();
  }

  /**
   * Gets the maximum value for a column
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to check
   * @returns {Promise<number>} Maximum value
   */
  public static max<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().max(column);
  }

  /**
   * Gets the minimum value for a column
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to check
   * @returns {Promise<number>} Minimum value
   */
  public static min<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().min(column);
  }

  /**
   * Gets the average value for a column
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to check
   * @returns {Promise<number>} Average value
   */
  public static avg<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().avg(column);
  }

  /**
   * Gets the sum of values for a column
   * @template M Type of the model class
   * @param {keyof M["$schema"]} column Column to sum
   * @returns {Promise<number>} Sum of values
   */
  public static sum<M extends typeof Model<any>>(
    this: M,
    column: keyof M["$schema"],
  ) {
    return this.query().sum(column);
  }

  public static groupBy<M extends typeof Model<any>>(
    this: M,
    ...fields: (keyof M["$schema"] | Array<keyof M["$schema"]>)[]
  ) {
    return this.query().groupBy(...fields);
  }

  /**
   * Eager loads a relation
   * @template M Type of the model class
   * @param {string} relation Relation name
   * @param {IRelationOptions} [options={}] Relation loading options
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static with<M extends typeof Model<any>>(
    this: M,
    relation: string,
    options: IRelationOptions = {},
  ) {
    const model = this.query();
    model.$alias = relation;
    model.$options = options;
    model[relation]();

    return model;
  }

  /**
   * Eager loads a relation on an instance
   * @param {string} relation Relation name
   * @param {IRelationOptions} [options={}] Relation loading options
   * @returns {this} Model instance
   */
  public with(relation: string, options: IRelationOptions = {}) {
    this.$alias = relation;
    this.$options = options;
    this[relation]();

    return this;
  }

  /**
   * Defines a has-many relationship
   * @template M Type of the related model
   * @param {new () => Model<M>} model Related model class
   * @param {keyof M} foreignKey Foreign key on related model
   * @param {keyof T} localKey Local key on this model
   * @returns {HasMany<T, M>} HasMany relationship instance
   */
  public hasMany<M>(
    model: new () => Model<M>,
    foreignKey?: keyof M,
    localKey?: keyof T,
  ) {
    const relation = new model();

    if (!foreignKey)
      foreignKey = (relation.constructor.name.toLowerCase() + "Id") as keyof M;
    if (!localKey) localKey = "_id" as keyof T;

    const hasMany: IRelationHasMany = {
      type: IRelationTypes.hasMany,
      model: this,
      relatedModel: relation,
      foreignKey: foreignKey as string,
      localKey: localKey as string,
      alias: this.$alias,
      options: this.$options,
    };
    const lookups = HasMany.generate(hasMany);
    this.$lookups = [...this.$lookups, ...lookups];

    return new HasMany<T, M>(this, relation, foreignKey, localKey);
  }

  /**
   * Defines a has-one relationship
   * @template M Type of the related model
   * @param {new () => Model<M>} model Related model class
   * @param {keyof M} foreignKey Foreign key on related model
   * @param {keyof T} localKey Local key on this model
   * @returns {HasOne<T, M>} HasOne relationship instance
   */
  public hasOne<M>(
    model: new () => Model<M>,
    foreignKey: keyof M,
    localKey: keyof T,
  ) {
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
    const lookups = HasOne.generate(hasOne);
    this.$lookups = [...this.$lookups, ...lookups];

    return new HasOne<T, M>(this, relation, foreignKey, localKey);
  }

  /**
   * Defines a belongs-to relationship
   * @template M Type of the related model
   * @param {new () => Model<M>} model Related model class
   * @param {keyof T} foreignKey Foreign key on this model
   * @param {keyof M} ownerKey Owner key on related model
   * @returns {BelongsTo<T, M>} BelongsTo relationship instance
   */
  public belongsTo<M>(
    model: new () => Model<M>,
    foreignKey?: keyof T,
    ownerKey?: keyof M,
  ) {
    const relation = new model();

    if (!foreignKey)
      foreignKey = (relation.constructor.name.toLowerCase() + "Id") as keyof T;
    if (!ownerKey) ownerKey = "_id" as keyof M;

    const belongsTo: IRelationBelongsTo = {
      type: IRelationTypes.belongsTo,
      model: this,
      relatedModel: relation,
      foreignKey: foreignKey as string,
      ownerKey: ownerKey as string,
      alias: this.$alias,
      options: this.$options,
    };
    const lookupsBelongsTo = BelongsTo.generate(belongsTo);
    this.$lookups = [...this.$lookups, ...lookupsBelongsTo];

    return new BelongsTo<T, M>(this, relation, foreignKey, ownerKey);
  }

  /**
   * Defines a has-many-through relationship
   * @template M Type of the related model
   * @template TM Type of the intermediate model
   * @param {new () => Model<M>} model Related model class
   * @param {new () => Model<TM>} throughModel Intermediate model class
   * @param {keyof TM} foreignKey Foreign key on intermediate model
   * @param {keyof M} foreignKeyThrough Foreign key on related model
   * @param {keyof T} localKey Local key on this model
   * @param {keyof TM} localKeyThrough Local key on intermediate model
   * @returns {HasManyThrough<T, M, TM>} HasManyThrough relationship instance
   */
  public hasManyThrough<M, TM>(
    model: new () => Model<M>,
    throughModel: new () => Model<TM>,
    foreignKey?: keyof TM,
    foreignKeyThrough?: keyof M,
    localKey: keyof T = "_id" as keyof T,
    localKeyThrough: keyof TM = "_id" as keyof TM,
  ) {
    const relation = new model();
    const through = new throughModel();

    if (!foreignKey)
      foreignKey = (relation.constructor.name.toLowerCase() + "Id") as keyof TM;
    if (!foreignKeyThrough)
      foreignKeyThrough = (through.constructor.name.toLowerCase() +
        "_id") as keyof M;

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
    const lookups = HasManyThrough.generate(hasManyThrough);
    this.$lookups = [...this.$lookups, ...lookups];

    return new HasManyThrough<T, M, TM>(
      this,
      relation,
      through,
      foreignKey,
      foreignKeyThrough,
      localKey,
      localKeyThrough,
    );
  }

  /**
   * Defines a belongs-to-many relationship
   * @template M Type of the related model
   * @template TM Type of the pivot model
   * @param {new () => Model<M>} model Related model class
   * @param {new () => Model<TM>} pivotModel Pivot model class
   * @param {keyof TM} foreignPivotKey Foreign key on pivot model for this model
   * @param {keyof TM} relatedPivotKey Foreign key on pivot model for related model
   * @param {keyof T} parentKey Primary key on this model
   * @param {keyof M} relatedKey Primary key on related model
   * @returns {BelongsToMany<T, M, TM>} BelongsToMany relationship instance
   */
  public belongsToMany<M, TM>(
    model: new () => Model<M>,
    collection?: string,
    foreignPivotKey?: keyof TM,
    relatedPivotKey?: keyof TM,
    parentKey: keyof T = "_id" as keyof T,
    relatedKey: keyof M = "_id" as keyof M,
  ) {
    const relation = new model();
    const names = [
      this.constructor.name.toLowerCase(),
      relation.constructor.name.toLowerCase(),
    ].sort();

    if (!collection) collection = `${names[0]}_${names[1]}`;

    const pivot = Model.query();
    pivot.$collection = collection;

    if (!foreignPivotKey)
      foreignPivotKey = (this.constructor.name.toLowerCase() +
        "Id") as keyof TM;
    if (!relatedPivotKey)
      relatedPivotKey = (relation.constructor.name.toLowerCase() +
        "Id") as keyof TM;

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
      relatedKey,
    );
  }

  /**
   * Defines a morph-many relationship
   * @template M Type of the related model
   * @param {new () => Model<M>} model Related model class
   * @param {string} name Name of the polymorphic relation
   * @returns {MorphMany<T, M>} MorphMany relationship instance
   */
  public morphMany<M>(model: new () => Model<M>, name: string) {
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

    return new MorphMany<T, M>(this, relation, name);
  }

  /**
   * Defines a morph-to relationship
   * @template M Type of the related model
   * @param {new () => Model<M>} model Related model class
   * @param {string} name Name of the polymorphic relation
   * @returns {MorphTo<T, M>} MorphTo relationship instance
   */
  public morphTo<M>(model: new () => Model<M>, name: string) {
    const relation = new model();

    const morphTo: IRelationMorphTo = {
      type: IRelationTypes.morphTo,
      model: this,
      relatedModel: relation,
      morph: name,
      morphId: `${name}Id`,
      morphType: `${name}Type`,
      alias: this.$alias,
      options: this.$options,
    };
    const lookups = MorphTo.generate(morphTo);
    this.$lookups = [...this.$lookups, ...lookups];

    return new MorphTo<T, M>(this, relation, name);
  }

  /**
   * Defines a morph-to-many relationship
   * @template M Type of the related model
   * @param {new () => Model<M>} model Related model class
   * @param {string} name Name of the polymorphic relation
   * @returns {MorphToMany<T, M>} MorphToMany relationship instance
   */
  public morphToMany<M>(model: new () => Model<M>, name: string) {
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

    return new MorphToMany<T, M>(this, relation, name);
  }

  /**
   * Defines a morphed-by-many relationship
   * @template M Type of the related model
   * @param {new () => Model<M>} model Related model class
   * @param {string} name Name of the polymorphic relation
   * @returns {MorphedByMany<T, M>} MorphedByMany relationship instance
   */
  public morphedByMany<M>(model: new () => Model<M>, name: string) {
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

    return new MorphedByMany<T, M>(this, relation, name);
  }

  /**
   * Creates a new query builder instance
   * @template M Type of the model class
   * @returns {Model<M["$schema"]>} New query builder instance
   */
  public static query<M extends typeof Model<any>>(
    this: M,
  ): Model<M["$schema"]> {
    return new this();
  }
}

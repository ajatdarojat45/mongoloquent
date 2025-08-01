import {
  BulkWriteOptions,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  ObjectId,
} from "mongodb";

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
   *
   * * @var any
   */
  [key: string]: any;

  public static $schema: any;
  protected static $timezone: string;
  protected static $connection: string;
  protected static $databaseName: string;

  /**
   * The relationships that should always be loaded.
   *
   * @var Array
   */
  protected $with: string[] = [];

  /**
   * The relationships that should not be loaded.
   *
   * @var Array
   */
  private $without: string[] = [];

  /**
   * The relationships that should be loaded.
   *
   * @var Array
   */
  private $withOnly: string[] = [];

  protected $nested: string[] = [];

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
   * @param {FindOneAndUpdateOptions | InsertOneOptions} [options] MongoDB options
   * @returns {Promise<any>} Updated or created document
   */
  public static async updateOrCreate<M extends typeof Model<any>>(
    this: M,
    filter: Partial<FormSchema<M["$schema"]>>,
    doc?: Partial<FormSchema<M["$schema"]>>,
    options?: FindOneAndUpdateOptions | InsertOneOptions,
  ) {
    return this.query().updateOrCreate(filter, doc, options);
  }

  /**
   * Updates a document or inserts it if it doesn't exist
   * @template M Type of the model class
   * @param {Partial<M["$schema"]>} filter Filter to find document
   * @param {Partial<FormSchema<M["$schema"]>>} doc Document to update or insert
   * @param {FindOneAndUpdateOptions | InsertOneOptions} [options] MongoDB options
   * @returns {Promise<any>} Updated or inserted document
   */
  public static async updateOrInsert<M extends typeof Model<any>>(
    this: M,
    filter: Partial<FormSchema<M["$schema"]>>,
    doc?: Partial<FormSchema<M["$schema"]>>,
    options?: FindOneAndUpdateOptions | InsertOneOptions,
  ) {
    return this.query().updateOrInsert(filter, doc, options);
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
    ...fields: (
      | keyof M["$schema"]
      | Array<keyof M["$schema"]>
      | (string & {})
    )[]
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
    ...fields: (
      | keyof M["$schema"]
      | Array<keyof M["$schema"]>
      | (string & {})
    )[]
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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

  /**
   * Sets the limit for the query (alias for limit)
   * @template M Type of the model class
   * @param {number} value Maximum number of documents to return
   * @returns {Model<M["$schema"]>} Query builder instance
   */
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
    ...fields: (
      | keyof M["$schema"]
      | Array<keyof M["$schema"]>
      | (string & {})
    )[]
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

  /**
   * Gets values from specified fields as an array
   * @template M Type of the model class
   * @param {...(keyof M["$schema"] | Array<keyof M["$schema"]>)[]} fields Fields to retrieve values from
   * @returns {Promise<any[]>} Array of field values
   */
  public static async pluck<M extends typeof Model<any>>(
    this: M,
    ...fields: (
      | keyof M["$schema"]
      | Array<keyof M["$schema"]>
      | (string & {})
    )[]
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
    ...fields: (
      | keyof M["$schema"]
      | Array<keyof M["$schema"]>
      | (string & {})
    )[]
  ) {
    return this.query().first(...fields);
  }

  /**
   * Gets the first document matching the filter or creates it
   * @template M Type of the model class
   * @param {Partial<M["$schema"]>} filter Filter to find the document
   * @param {Partial<FormSchema<M["$schema"]>>} doc Document to create if not found
   * @param {InsertOneOptions} [options] MongoDB insert options
   * @returns {Promise<any>} Retrieved or created document
   */
  public static firstOrCreate<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc?: Partial<FormSchema<M["$schema"]>>,
    options?: InsertOneOptions,
  ) {
    return this.query().firstOrCreate(filter, doc, options);
  }

  /**
   * Gets the first document matching the filter or returns a new model instance
   * @template M Type of the model class
   * @param {Partial<M["$schema"]>} filter Filter to find the document
   * @param {Partial<FormSchema<M["$schema"]>>} doc Document properties for the new instance
   * @param {InsertOneOptions} [options] MongoDB insert options
   * @returns {Promise<any>} Retrieved document or new instance
   */
  public static firstOrNew<M extends typeof Model<any>>(
    this: M,
    filter: Partial<M["$schema"]>,
    doc?: Partial<FormSchema<M["$schema"]>>,
    options?: InsertOneOptions,
  ) {
    return this.query().firstOrNew(filter, doc, options);
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
   * Finds a document by ID or throws exception if not found
   * @param {string|ObjectId} id - Document ID
   * @returns {Promise<any>} Document
   * @throws {MongoloquentNotFoundException} If no document found
   */
  public static async findOrFail(id: string | ObjectId) {
    return this.query().findOrFail(id);
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
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
    column: keyof M["$schema"] | (string & {}),
  ) {
    return this.query().sum(column);
  }

  /**
   * Groups the query results by specified fields
   * @template M Type of the model class
   * @param {...(keyof M["$schema"] | Array<keyof M["$schema"]>)[]} fields Fields to group by
   * @returns {Model<M["$schema"]>} Query builder instance
   */
  public static groupBy<M extends typeof Model<any>>(
    this: M,
    ...fields: (
      | keyof M["$schema"]
      | Array<keyof M["$schema"]>
      | (string & {})
    )[]
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
    relation: string | Record<string, string[]>,
    options: IRelationOptions = {},
  ) {
    const model = this.query();
    model.$options = options;

    if (typeof relation === "string") {
      if (relation.includes(".")) {
        const [_relation, ...rest] = relation.split(".");

        relation = _relation;
        model.$nested = [...model.$nested, ...rest];
      }

      model.$alias = relation;

      if (typeof model[relation] === "function") {
        model[relation]();
      }
    } else if (typeof relation === "object") {
      for (const key in relation) {
        model.$alias = key;
        model.$nested = relation[key];

        if (typeof model[key] === "function") {
          model[key]();
        }
      }
    }

    return model;
  }

  /**
   * Eager loads a relation on an instance
   * @param {string} relation Relation name
   * @param {IRelationOptions} [options={}] Relation loading options
   * @returns {this} Model instance
   */
  public with(
    relation: string | Record<string, string[]>,
    options: IRelationOptions = {},
  ) {
    this.$options = options;

    if (typeof relation === "string") {
      const [_relation, ...rest] = relation.split(".");
      if (relation.includes(".")) {
        relation = _relation;
        this.$nested = [...this.$nested, ...rest];
      }

      this.$alias = relation;

      if (typeof this[relation] === "function") {
        this[relation]();
      }
    } else if (typeof relation === "object") {
      for (const key in relation) {
        this.$alias = key;
        this.$nested = relation[key];

        if (typeof this[key] === "function") {
          this[key]();
        }
      }
    }

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
      foreignKey = (this.constructor.name.toLowerCase() + "Id") as keyof M;
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
    foreignKey?: keyof M,
    localKey?: keyof T,
  ) {
    const relation = new model();

    if (!foreignKey)
      foreignKey = (this.constructor.name.toLowerCase() + "Id") as keyof M;

    if (!localKey) localKey = "_id" as keyof T;

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
      foreignKey = (this.constructor.name.toLowerCase() + "Id") as keyof TM;
    if (!foreignKeyThrough)
      foreignKeyThrough = (through.constructor.name.toLowerCase() +
        "Id") as keyof M;

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
   * @param {string} [collection] Pivot collection name
   * @param {keyof TM} [foreignPivotKey] Foreign key on pivot model for this model
   * @param {keyof TM} [relatedPivotKey] Foreign key on pivot model for related model
   * @param {keyof T} [parentKey="_id"] Primary key on this model
   * @param {keyof M} [relatedKey="_id"] Primary key on related model
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
   * Excludes default relations from the query
   * @param {string | string[]} Name of the relation
   *
   * @returns {this} Model instance
   **/
  static without(this: typeof Model<any>, ...relations: (string | string[])[]) {
    const flattenedRelations = relations.reduce<string[]>((acc, relation) => {
      return acc.concat(Array.isArray(relation) ? relation : [relation]);
    }, []);

    const model = new this();
    model.$without = [...flattenedRelations];

    model.runDefaultRelation();
    return model;
  }

  /**
   * Includes only specific default relations in the query
   * @param {string | string[]} Name of the relation
   *
   * @returns {this} Model instance
   **/
  static withOnly(
    this: typeof Model<any>,
    ...relations: (string | string[])[]
  ) {
    const flattenedRelations = relations.reduce<string[]>((acc, relation) => {
      return acc.concat(Array.isArray(relation) ? relation : [relation]);
    }, []);

    const model = new this();
    model.$withOnly = [...flattenedRelations];

    model.runDefaultRelation();
    return model;
  }

  /**
   * Creates a new query builder instance
   * @template M Type of the model class
   * @returns {Model<M["$schema"]>} New query builder instance
   */
  public static query<M extends typeof Model<any>>(
    this: M,
  ): Model<M["$schema"]> {
    const model = new this();

    if (this.$connection) model.setConnection(this.$connection);
    if (this.$databaseName) model.setDatabaseName(this.$databaseName);
    if (this.$timezone) model.setTimezone(this.$timezone);

    model.runDefaultRelation();

    return model;
  }

  public static setConnection(connection: string): string {
    this.$connection = connection;
    return this.$connection;
  }

  public static setDatabaseName(name: string): string {
    this.$databaseName = name;
    return this.$databaseName;
  }

  public static setTimezone(timezone: string): string {
    this.$timezone = timezone;
    return this.$timezone;
  }

  /**
   * Runs the default relations based on the current state of the model
   * @returns {this} Model instance
   */
  private runDefaultRelation() {
    let _with = this.$with;

    if (this.$withOnly.length > 0) _with = this.$withOnly;

    if (this.$withOnly.length === 0 && this.$without.length > 0) {
      _with = this.$with.filter((el) => !this.$without.includes(el));
    }

    _with.forEach((el) => {
      this.with(el);
    });

    return this;
  }
}

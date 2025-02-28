import { BulkWriteOptions, FindOneAndUpdateOptions, InsertOneOptions, ObjectId, OptionalId, OptionalUnlessRequiredId, UpdateFilter, UpdateOptions, WithId } from "mongodb"
import Relation from "./Relation";
import dayjs from "dayjs";
import { TIME_ZONE } from "./configs/app";

export default class Model extends Relation {
  protected static $useTimestamps: boolean = false;
  protected static $timezone: string = TIME_ZONE

  /**
  * The name of the "created at" column.
  *
  * @var string
  */
  protected static $CREATED_AT = 'CREATED_AT';

  /**
   * The name of the "updated at" column.
   *
   * @var string
   */
  protected static $UPDATED_AT = 'UPDATED_AT';

  /**
   * Execute queries
   *
   * @return Promise<AggregationCursor<Document>>
   */
  static async aggregate() {
    try {
      this.checkSoftDelete()
      this.generateColumns()
      this.generateExcludes()
      this.generateWheres()
      this.generateOrders()
      this.generateGroups()

      const collection = this.getCollection();
      const aggregate = collection.aggregate([...this.$stages, ...this.$lookups]);

      this.resetQuery()
      this.resetRelation()

      return aggregate
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all of the items in the collection.
   *
   * @return Promise<WithId<Document>[]>
   */
  static async all() {
    try {
      const collection = this.getCollection();

      let query = {};

      if (this.$useSoftDelete) query = { isDeleted: false };

      return await collection.find(query).toArray();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get items from the collection.
   *
   * @param string|string[] columns
   *
   * @return Promise<Document[]>
   */
  static async get(columns: string | string[] = []) {
    try {
      if (Array.isArray(columns))
        this.$columns.push(...columns)
      else
        this.$columns.push(columns)

      const aggregate = await this.aggregate();

      return await aggregate.toArray();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get item from the collection.
   *
   * @param string|string[] columns
   *
   * @return Promise<Document|null>
   */
  static async first(columns: string | string[] = []) {
    try {
      const data = await this.get(columns)
      if (data.length > 0) {
        return data[0]
      }

      return null
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get item by id 
   *
   * @param string|string[] columns
   *
   * @return Promise<Document|null>
   */
  static async find(id: string | ObjectId) {
    try {
      this.where("_id", id)

      const data = await this.get()
      if (data.length > 0) {
        return data[0]
      }

      return null
    } catch (error) {
      throw error;
    }
  }

  /**
    * Retrieve the values of a specific column from the query results.
    *
    * @param string columns
    *
    * @return Promise<any>
    */
  static async pluck(column: string) {
    try {
      const data = await this.get()

      return data.map(el => el[column])
    } catch (error) {
      throw error;
    }
  }

  /**
    * Save the model to the database.
    *
    * @param  Document payload
    *
    * @return Promise<WithId<Document>> 
    */
  public static async insert(doc: object, options?: InsertOneOptions): Promise<object> {
    const collection = this.getCollection();

    let newDoc = this.checkUseTimestamps(doc)
    newDoc = this.checkUseSoftdelete(newDoc)

    const data = await collection.insertOne(newDoc, options)

    return { _id: data.insertedId, ...doc };
  }

  public static async save(doc: object, options?: InsertOneOptions) {
    return this.insert(doc, options)
  }

  public static async create(doc: object, options?: InsertOneOptions) {
    return this.insert(doc, options)
  }

  public static async insertMany(docs: OptionalId<Document>[], options?: BulkWriteOptions) {
    const collection = this.getCollection()

    const newDocs = docs.map(el => {
      let newEl = this.checkUseTimestamps(el)
      newEl = this.checkUseSoftdelete(newEl)

      return newEl
    })

    const data = await collection.insertMany(newDocs, options)

    const result: ObjectId[] = [];

    for (var key in data.insertedIds) {
      result.push(data.insertedIds[key]);
    }

    return result;
  }

  /**
   * Update the model in the database.
   *
   * @param  object  $attributes
   * @param  object  $options
   * @return bool
   */
  public static async update(doc: UpdateFilter<Document>, options?: FindOneAndUpdateOptions) {
    const collection = this.getCollection()

    this.generateWheres()
    let filter = {}
    if (this.$stages.length > 0) filter = this.$stages[0].$match

    let newDoc = this.checkUseTimestamps(doc, false)
    newDoc = this.checkUseSoftdelete(newDoc)

    const data = await collection.findOneAndUpdate(
      { ...filter },
      {
        $set: {
          ...newDoc,
        },
      },
      {
        ...options,
        returnDocument: "after",
      }
    );

    this.resetQuery()
    return data
  }

  public static async updateMany(doc: UpdateFilter<Document>, options?: UpdateOptions) {
    const collection = this.getCollection()

    this.generateWheres()
    let filter = {}
    if (this.$stages.length > 0) filter = this.$stages[0].$match

    let newDoc = this.checkUseTimestamps(doc, false)
    newDoc = this.checkUseSoftdelete(newDoc)

    const data = await collection.updateMany({ ...filter }, {
      $set: {
        ...newDoc,
      },
    }, options);

    this.resetQuery();

    return {
      modifiedCount: data.modifiedCount,
    };
  }

  /**
   * Delete the model from the database.
   *
   * @return bool|null
   *
   * @throws \LogicException
   */
  public static async delete() {
    const collection = this.getCollection();

    if (this.$useSoftDelete) {
      return this.update({})
    }

    this.generateWheres();
    let filter = {}
    if (this.$stages.length > 0) filter = this.$stages[0].$match

    const data = await collection.findOneAndDelete(filter);
    this.resetQuery();

    return data || null;
  }

  static async deleteMany(): Promise<object> {
    const collection = this.getCollection();

    if (this.$useSoftDelete) {
      return this.updateMany({})
    }

    this.generateWheres();
    let filter = {}
    if (this.$stages.length > 0) filter = this.$stages[0].$match

    const data = await collection.deleteMany(filter);
    this.resetQuery();

    return {
      deletedCount: data.deletedCount,
    };
  }

  static async destroy(
    ids: string | string[] | ObjectId | ObjectId[]
  ): Promise<object> {
    let filter = []

    if (!Array.isArray(ids)) {
      filter = [new ObjectId(ids)];
    } else {
      filter = ids.map((el) => new ObjectId(el));
    }

    if (this.$useSoftDelete) {
      return await this.whereIn("_id", filter).updateMany({})
    }

    return await this.whereIn("_id", filter).deleteMany();
  }



  /**
   * Force a hard delete on a soft deleted model.
   *
   * This method protects developers from running forceDelete when the trait is missing.
   *
   * @return bool|null
   */
  public static async forceDelete() {
    const collection = this.getCollection();
    this.generateWheres();

    let filter = {}
    if (this.$stages.length > 0) filter = this.$stages[0].$match


    const data = await collection.deleteMany(filter);

    this.resetQuery();
    return {
      deletedCount: data.deletedCount,
    };

  }

  /**
   * Force a hard destroy on a soft deleted model.
   *
   * This method protects developers from running forceDestroy when the trait is missing.
   *
   * @param string|string[]|ObjectId|ObjectId[]  ids
   * @return number
   */
  public static async forceDestroy(ids: string | string[] | ObjectId | ObjectId[]) {
    let filter = []

    if (!Array.isArray(ids)) {
      filter = [new ObjectId(ids)];
    } else {
      filter = ids.map((el) => new ObjectId(el));
    }

    if (this.$useSoftDelete) {
      return await this.whereIn("_id", filter).updateMany({})
    }

    return await this.whereIn("_id", filter).deleteMany();

  }

  static async restore() {
    this.onlyTrashed();

    return await this.updateMany({ isDeleted: false })
  }

  static async max(field: string, type: string = "max"): Promise<number> {
    const collection = this.getCollection();
    this.generateWheres();

    const aggregate = await collection
      .aggregate([
        ...this.$stages,
        {
          $group: {
            _id: null,
            [type]: {
              [`$${type}`]: `$${field}`
            },
          },
        },
      ])
      .next();

    this.resetQuery();

    return aggregate?.[type] || 0;
  }

  static async min(field: string) {
    return this.max(field, "min")
  }


  static async avg(field: string) {
    return this.max(field, "avg")
  }

  static async sum(field: string) {
    return this.max(field, "sum")
  }

  static async count(): Promise<number> {
    const collection = this.getCollection();

    this.generateWheres()

    const aggregate = await collection
      .aggregate([
        ...this.$stages,
        {
          $count: "total",
        },
      ])
      .next();

    this.resetQuery();
    return aggregate?.total || 0;
  }

  public static checkUseTimestamps(doc: object, isNew: boolean = true): object {
    if (this.$useTimestamps) {
      const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
      const now = dayjs.utc(current).tz(this.$timezone).toDate();

      if (!isNew)
        return { ...doc, [this.$UPDATED_AT]: now };

      return { ...doc, [this.$CREATED_AT]: now, [this.$UPDATED_AT]: now };
    }

    return doc;
  }

  public static checkUseSoftdelete(doc: object, isDeleted: boolean = false): object {
    if (this.$useSoftDelete) {
      if (isDeleted) {
        const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
        const now = dayjs.utc(current).tz(this.$timezone).toDate();

        return { ...doc, [this.$IS_DELETED]: true, [this.$DELETED_AT]: now };
      }

      return { ...doc, [this.$IS_DELETED]: false };
    }

    return doc;
  }

}

import { ObjectId } from "mongodb"
import Relation from "./Relation";

export default class Model extends Relation {
  /**
   * Identifier for soft delete feature
   *
   * @var string
   */
  public static $useSoftDelete: boolean = false

  /**
   * The name of the "created at" column.
   *
   * @var string
   */
  protected static $CREATED_AT = 'created_at';

  /**
   * The name of the "updated at" column.
   *
   * @var string
   */
  protected static $UPDATED_AT = 'updated_at';

  /**
   * Execute queries
   *
   * @return Promise<AggregationCursor<Document>>
   */
  static async aggregate() {
    try {
      this.generateColumns()
      this.generateExcludes()
      this.generateWheres()
      this.generateOrders()
      this.generateGroups()

      const collection = this.getCollection();
      const aggregate = collection.aggregate(
        [...this.$stages, this.$lookups]
      );

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
   * Update the model in the database.
   *
   * @param  object  $attributes
   * @param  object  $options
   * @return bool
   */
  public static update(payload: {}, options: {}): boolean {
    return true
  }

  /**
   * Save the model to the database.
   *
   * @param  array  $options
   * @return bool
   */
  public static save(options: {}): boolean {
    return true
  }

  /**
   * Destroy the models for the given IDs.
   *
   * @param  string|string[]|ObjectId|ObjectId[]  ids
   * @return int
   */
  public static destroy(ids: string | string[] | ObjectId | ObjectId[]): number {
    return 1
  }

  /**
   * Delete the model from the database.
   *
   * @return bool|null
   *
   * @throws \LogicException
   */
  public static delete(): boolean | null {
    return true
  }

  /**
   * Force a hard delete on a soft deleted model.
   *
   * This method protects developers from running forceDelete when the trait is missing.
   *
   * @return bool|null
   */
  public static forceDelete(): boolean | null {
    return this.delete();
  }

  /**
   * Force a hard destroy on a soft deleted model.
   *
   * This method protects developers from running forceDestroy when the trait is missing.
   *
   * @param string|string[]|ObjectId|ObjectId[]  ids
   * @return number
   */
  public static forceDestroy(ids: string | string[] | ObjectId | ObjectId[]): number {
    return this.destroy(ids);
  }
}

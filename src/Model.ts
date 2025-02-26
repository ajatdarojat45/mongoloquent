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
   * Eager load relations on the model.
   *
   * @param  string[]|string  $relations
   * @return $this
   */
  public static load($relations: string | string[]): Model {
    return this;
  }

  /**
   * Eager load relationships on the polymorphic relation of a model.
   *
   * @param  string  $relation
   * @param  string[]  $relations
   * @return $this
   */
  public static loadMorph($relation: string, $relations: string[]): Model {
    return this
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

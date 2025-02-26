import { Document } from "mongodb";
import Model from "./Model";
import Query from "./Query";
import { IRelationOptions } from "./interfaces/IRelation";
import HashOne from "./relations/HasOne";
import BelongsTo from "./relations/BelongsTo";
import HasMany from "./relations/HasMany";
import BelongsToMany from "./relations/BelongsToMany";

export default class Relation extends Query {
  /**
   * Property to set relationship alias
   *
   * @var string
   */
  private static $alias: string = ""

  /**
   * Property to set relationship options
   *
   * @var IWithOptions
   */
  private static $options: IRelationOptions

  /**
   * The current $lookup to be run.
   *
   * @var Document[]
   */
  private static $lookups: Document[] = []

  /**
   * Define a one-to-one relationship.
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string localKey
   *
   * @return Model 
   */
  static hasOne(related: typeof Model, foreignKey: string, localKey: string = "_id") {
    const lookup = HashOne.generate(related, foreignKey, localKey, this.$alias, this.$options)
    this.$lookups.push(...lookup)

    return related
  }

  /**
   * Define a belongsTo relationship.
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string localKey
   *
   * @return Model 
   */
  static belongsTo(related: typeof Model, foreignKey: string, ownerKey: string = "_id") {
    const lookup = BelongsTo.generate(related, foreignKey, ownerKey, this.$alias, this.$options)
    this.$lookups.push(...lookup)

    return related
  }

  /**
   * Define a one-to-many relationship.
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string localKey
   *
   * @return Model 
   */
  static hasMany(related: typeof Model, foreignKey: string, localKey: string = "_id") {
    const lookup = HasMany.generate(related, foreignKey, localKey, this.$alias, this.$options)
    this.$lookups.push(...lookup)

    return related
  }

  /**
    * Define a belongsToMany relationship.
    *
    * @param Model related
    * @param Model table
    * @param string foreignPivotKey
    * @param string relatedPivotKey
    * @param  string parentKey
    * @param  string relatedKey
    *
    * @return Model 
    */
  static belongsToMany(related: typeof Model, table: typeof Model, foreignPivotKey: string, relatedPivotKey: string, parentKey: string = "_id", relatedKey: string = "_id") {
    const lookup = BelongsToMany.generate(related, table, foreignPivotKey, relatedPivotKey, parentKey, relatedKey, this.$alias, this.$options)
    this.$lookups.push(...lookup)

    return related
  }

  /**
   * Select columns in has one relation
   *
   * @param string|string[] columns
   * @param  string alias
   * @param  boolean isSelect
   * @return mongodb/Document[]
   */
  static selectRelationColumns(columns: string | string[], alias: string, isSelect: boolean = true) {
    const lookup = []
    const _columns: string[] = []
    const additionals: Document[] = []
    let project = {
      $project: {
        document: "$$ROOT",
      },
    };

    if (typeof columns === "string") _columns.push(columns)
    else _columns.push(...columns)

    _columns.forEach((el) => {
      project = {
        ...project,
        $project: {
          ...project.$project,
          [`${alias}.${el}`]: isSelect ? 1 : -1,
        },
      };
    });

    if (isSelect)
      additionals.push(
        {
          $set: {
            [`document.${alias}`]: `$${alias}`,
          },
        },
        {
          $replaceRoot: {
            newRoot: "$document",
          },
        })

    lookup.push(project, ...additionals);

    return lookup
  }

  /**
   * Excluded columns in has one relation
   *
   * @param string|string[] columns
   * @param  string alias
   * @param  boolean isSelect
   * @return mongodb/Document[]
   */
  static excludeRelationColumns(columns: string | string[], alias: string) {
    return this.selectRelationColumns(columns, alias, false)
  }
}

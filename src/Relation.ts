import { Document, ObjectId } from "mongodb";
import Model from "./Model";
import Query from "./Query";
import { IRelationBelongsToMany, IRelationHasMany, IRelationHasManyThrough, IRelationMorphByMany, IRelationMorphMany, IRelationMorphToMany, IRelationOptions, IRelationTypes } from "./interfaces/IRelation";
import HasOne from "./relations/HasOne";
import BelongsTo from "./relations/BelongsTo";
import HasMany from "./relations/HasMany";
import BelongsToMany from "./relations/BelongsToMany";
import HasManyThrough from "./relations/HasManyThrough";
import MorphTo from "./relations/MorphTo";
import MorphMany from "./relations/MorphMany";
import MorphToMany from "./relations/MorphToMany";
import MorphByMany from "./relations/MorphByMany";

export default class Relation extends Query {
  /**
   * @note This property is used to store the alias for the relationship.
   * @var string
   */
  private static $alias: string = "";

  /**
   * @note This property is used to store the options for the relationship.
   * @var IRelationOptions
   */
  private static $options: IRelationOptions;

  /**
   * @note This property stores the lookup stages for the relationship.
   * @var Document[]
   */
  private static $lookups: Document[] = [];

  private static $relationship: IRelationHasMany | IRelationBelongsToMany | IRelationHasManyThrough | IRelationMorphMany | IRelationMorphToMany | IRelationMorphByMany | null = null

  /**
   * @note This method sets up the relationship and calls the corresponding relation method.
   * @param {string} relation - The name of the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {this} The current relation instance.
   */
  public static with<T extends typeof Relation>(
    this: T,
    relation: keyof T,
    options: IRelationOptions = {}
  ): T {
    // Check if the relation method exists
    if (typeof this[relation] === "function") {
      // Set the alias and options for the relation
      if (true) {
        const alias = relation as string;
        this.setAlias(alias)
        this.setOptions(options)
      }

      // Call the relation method
      (this[relation] as Function).call(this);
    } else {
      // Throw an error if the relation method is not found
      throw new Error(`Relation method ${String(relation)} not found.`);
    }

    return this;
  }

  /**
   * @note This method is an alias for the with method.
   * @param {string} relation - The name of the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {this} The current relation instance.
   */
  public static has<T extends typeof Relation>(
    this: T,
    relation: keyof T,
    options: IRelationOptions = {}
  ): T {
    // Call the with method
    return this.with(relation, options);
  }

  /**
   * @note This method defines a one-to-one relationship.
   * @param Model related - The related model.
   * @param {string} foreignKey - The foreign key.
   * @param {string} [localKey="_id"] - The local key.
   * @return {Model} The related model.
   */
  static hasOne(
    related: typeof Model,
    foreignKey: string,
    localKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the hasOne relationship
    const lookup = HasOne.generate(
      related,
      foreignKey,
      localKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    return related;
  }

  /**
   * @note This method defines a belongsTo relationship.
   * @param Model related - The related model.
   * @param {string} foreignKey - The foreign key.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @return {Model} The related model.
   */
  static belongsTo(
    related: typeof Model,
    foreignKey: string,
    ownerKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the belongsTo relationship
    const lookup = BelongsTo.generate(
      related,
      foreignKey,
      ownerKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    return related;
  }

  /**
   * @note This method defines a one-to-many relationship.
   * @param Model related - The related model.
   * @param {string} foreignKey - The foreign key.
   * @param {string} [localKey="_id"] - The local key.
   * @return {Model} The related model.
   */
  static hasMany(
    related: typeof Model,
    foreignKey: string,
    localKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the hasMany relationship
    const lookup = HasMany.generate(
      related,
      foreignKey,
      localKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    const hasMany: IRelationHasMany = {
      type: IRelationTypes.hasMany,
      model: related,
      foreignKey,
      localKey,
      parentId: this.getParentId()
    }
    this.setRelationship(hasMany)

    return related;
  }

  /**
   * @note This method defines a belongsToMany relationship.
   * @param Model related - The related model.
   * @param Model table - The pivot table model.
   * @param {string} foreignPivotKey - The foreign pivot key.
   * @param {string} relatedPivotKey - The related pivot key.
   * @param {string} [parentKey="_id"] - The parent key.
   * @param {string} [relatedKey="_id"] - The related key.
   * @return {Model} The related model.
   */
  static belongsToMany(
    related: typeof Model,
    pivot: typeof Model,
    foreignPivotKey: string,
    relatedPivotKey: string,
    parentKey: string = "_id",
    relatedKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the belongsToMany relationship
    const lookup = BelongsToMany.generate(
      related,
      pivot,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    const belongsToMany: IRelationBelongsToMany = {
      type: IRelationTypes.belongsToMany,
      model: related,
      pivot,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey,
      parentId: this.getParentId(),
    }

    related.setRelationship(belongsToMany)
    return related;
  }

  /**
   * @note This method defines a hasManyThrough relationship.
   * @param Model related - The related model.
   * @param Model through - The through model.
   * @param {string} firstKey - The first key.
   * @param {string} secondKey - The second key.
   * @param {string} [localKey="_id"] - The local key.
   * @param {string} [secondLocalKey="_id"] - The second local key.
   * @return {Model} The related model.
   */
  static hasManyThrough(
    related: typeof Model,
    through: typeof Model,
    firstKey: string,
    secondKey: string,
    localKey: string = "_id",
    secondLocalKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the hasManyThrough relationship
    const lookup = HasManyThrough.generate(
      related,
      through,
      firstKey,
      secondKey,
      localKey,
      secondLocalKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)


    const hasManyThrough: IRelationHasManyThrough = {
      type: IRelationTypes.hasManyThrough,
      model: related,
      through: through,
      firstKey,
      secondKey,
      localKey,
      secondLocalKey,
      parentId: this.getParentId()
    }
    related.setRelationship(hasManyThrough)

    return related;
  }

  /**
   * @note This method defines a morphTo relationship.
   * @param Model target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @return {Model} The target model.
   */
  static morphTo(
    target: typeof Model,
    name: string,
    ownerKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the morphTo relationship
    const lookup = MorphTo.generate(
      target,
      name,
      `${name}Type`,
      `${name}Id`,
      ownerKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    return target;
  }

  /**
   * @note This method defines a morphMany relationship.
   * @param Model target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @return {Model} The target model.
   */
  static morphMany(
    target: typeof Model,
    name: string,
    ownerKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the morphMany relationship
    const lookup = MorphMany.generate(
      target,
      name,
      `${name}Type`,
      `${name}Id`,
      ownerKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    const morphMany: IRelationMorphMany = {
      type: IRelationTypes.morphMany,
      model: target,
      morphType: `${name}Type`,
      morphId: `${name}Id`,
      parentId: this.getParentId(),
    }
    target.setRelationship(morphMany)

    return target;
  }

  /**
   * @note This method defines a morphToMany relationship.
   * @param Model target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @return {Model} The target model.
   */
  static morphToMany(
    target: typeof Model,
    name: string,
    ownerKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the morphToMany relationship
    const lookup = MorphToMany.generate(
      target,
      name,
      `${name}Type`,
      `${name}Id`,
      ownerKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    const morphToMany: IRelationMorphToMany = {
      type: IRelationTypes.morphToMany,
      model: target,
      foreignKey: `${target.name.toLocaleLowerCase()}s`,
      collection: `${this.$alias}s`,
      morphType: `${name} Type`,
      morphId: `${name} Id`,
      ownerKey,
      parentId: this.getParentId(),
    }
    target.setRelationship(morphToMany)

    return target;
  }

  /**
   * @note This method defines a morphByMany relationship.
   * @param Model target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @return {Model} The target model.
   */
  static morphByMany(
    target: typeof Model,
    name: string,
    ownerKey: string = "_id"
  ): typeof Model {
    // Generate the lookup stages for the morphByMany relationship
    const lookup = MorphByMany.generate(
      target,
      name,
      `${name} Type`,
      `${name} Id`,
      ownerKey,
      this.$alias,
      this.$options
    );
    // Add the lookup stages to the $lookups array
    this.setLookups(lookup)

    const morphByMany: IRelationMorphByMany = {
      type: IRelationTypes.morphByMany,
      model: target,
      collection: `${this.$alias} s`,
      morphType: `${name} Type`,
      morphId: `${name} Id`,
      foreignKey: `${this.name.toLowerCase()} Id`,
      ownerKey,
      parentId: this.getParentId(),
    }
    target.setRelationship(morphByMany)

    return target;
  }

  /**
   * @note This method selects columns in a has one relation.
   * @param {string|string[]} columns - The columns to select.
   * @param {string} alias - The alias for the relation.
   * @param {boolean} [isSelect=true] - Whether to select or exclude the columns.
   * @return {Document[]} The lookup stages.
   */
  static selectRelationColumns(
    columns: string | string[],
    alias: string,
    isSelect: boolean = true
  ): Document[] {
    const lookup = [];
    const _columns: string[] = [];
    const additionals: Document[] = [];
    let project = {
      $project: {
        document: "$$ROOT",
      },
    };

    // Convert columns to an array if it's a string
    if (typeof columns === "string") _columns.push(columns);
    else _columns.push(...columns);

    // Add the columns to the project stage
    _columns.forEach((el) => {
      project = {
        ...project,
        $project: {
          ...project.$project,
          [`${alias}.${el} `]: isSelect ? 1 : -1,
        },
      };
    });

    // Add additional stages if selecting columns
    if (isSelect)
      additionals.push(
        {
          $set: {
            [`document.${alias} `]: `$${alias} `,
          },
        },
        {
          $replaceRoot: {
            newRoot: "$document",
          },
        }
      );

    // Add the project and additional stages to the lookup array
    lookup.push(project, ...additionals);

    return lookup;
  }

  private static setLookups(doc: Document): void {
    if (Array.isArray(doc))
      this.$lookups = [...this.$lookups, ...doc]
    else this.$lookups = [...this.$lookups, doc]
  }

  protected static getLookups(): Document[] {
    return this.$lookups
  }

  private static setOptions(options: IRelationOptions): void {
    this.$options = options
  }

  private static setAlias(name: string): void {
    this.$alias = name
  }

  private static setRelationship(
    relation:
      IRelationHasMany |
      IRelationHasManyThrough |
      IRelationBelongsToMany |
      IRelationMorphMany |
      IRelationMorphToMany |
      IRelationMorphByMany
  ): void {
    this.$relationship = relation
  }

  protected static getRelationship() {
    return this.$relationship
  }

  /**
   * @note This method excludes columns in a has one relation.
   * @param {string|string[]} columns - The columns to exclude.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
   */
  static excludeRelationColumns(
    columns: string | string[],
    alias: string
  ): Document[] {
    // Call selectRelationColumns with isSelect set to false
    return this.selectRelationColumns(columns, alias, false);
  }

  public static async attach(ids: string | string[] | ObjectId | ObjectId[]) {
    const relationship = this.getRelationship()

    if (relationship?.type === IRelationTypes.belongsToMany) return this.attachBelongsToMany(ids)
    else if (relationship?.type === IRelationTypes.morphToMany) return this.attachMorphToMany(ids)
  }

  public static detach(ids: string | string[] | ObjectId | ObjectId[]) {
    const relationship = this.getRelationship()

    if (relationship?.type === IRelationTypes.belongsToMany) return this.detachBelongsToMany(ids)
    else if (relationship?.type === IRelationTypes.morphToMany) return this.detachMorphToMany(ids)
  }

  private static async attachBelongsToMany(
    ids: string | string[] | ObjectId | ObjectId[]
  ) {
    const relationship = this.getRelationship()
    if (relationship?.type !== IRelationTypes.belongsToMany) return null

    let objectIds: ObjectId[] = [];
    let query: Document = {};

    if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.getCollection(relationship.pivot.$collection);
    const _payload: object[] = [];

    query = {
      [relationship.foreignPivotKey]: {
        $in: objectIds,
      },
      [relationship.relatedPivotKey]: relationship.parentId,
    };

    objectIds.forEach((id) =>
      _payload.push({
        [relationship.relatedPivotKey]: relationship.parentId,
        [relationship.foreignPivotKey]: id,
      })
    );

    // find data
    const existingData = await collection.find(query).toArray();

    // check data
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find((item: any) => {
        return JSON.stringify(item[relationship.foreignPivotKey]) === JSON.stringify(objectIds[i]);
      });

      // insert if data does not exist
      if (!existingItem) {
        await collection.insertOne(_payload[i]);
      }
    }

    return {
      message: "Attach successfully",
    };
  }

  private static async attachMorphToMany(
    ids: string | string[] | ObjectId | ObjectId[]
  ) {
    const relationship = this.getRelationship()
    if (relationship?.type !== IRelationTypes.morphToMany) return null

    let objectIds: ObjectId[] = [];
    let query = {};

    if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.getCollection(relationship.collection);
    const _payload: object[] = [];

    query = {
      [relationship.foreignKey]: { $in: ids },
      [relationship.morphId]: relationship.parentId,
      [relationship.morphType]: relationship.model.name,
    };

    objectIds.forEach((id) =>
      _payload.push({
        [relationship.foreignKey]: id,
        [relationship.morphId]: relationship.parentId,
        [relationship.morphType]: relationship.model.name,
      })
    );

    // find data
    const existingData = await collection.find(query).toArray();

    // check data
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find((item: any) => {
        return JSON.stringify(item[relationship.foreignKey]) === JSON.stringify(objectIds[i]);
      });

      // insert if data does not exist
      if (!existingItem) {
        await collection.insertOne(_payload[i]);
      }
    }

    return {
      message: "Attach successfully",
    };
  }

  public static async detachBelongsToMany(
    ids: string | string[] | ObjectId | ObjectId[]
  ) {
    const relationship = this.getRelationship();
    if (relationship?.type !== IRelationTypes.belongsToMany) return null

    let objectIds: ObjectId[] = [];
    let isDeleteAll = false;

    if (!Array.isArray(ids)) {
      objectIds = ids ? [new ObjectId(ids)] : [];
      isDeleteAll = !ids && true;
    }
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.getCollection(relationship.pivot.$collection);
    const query = {
      [relationship.foreignPivotKey]: {
        $in: ids,
      },
      [relationship.relatedPivotKey]: relationship.parentId,
    };

    isDeleteAll && delete query[relationship.foreignPivotKey];
    await collection.deleteMany(query);

    return {
      message: "Detach successfully",
    };
  }

  private static async detachMorphToMany(
    ids: string | string[] | ObjectId | ObjectId[]
  ) {
    const relationship = this.getRelationship()
    if (relationship?.type !== IRelationTypes.morphToMany) return null

    let objectIds: ObjectId[] = [];
    let isDeleteAll = false;

    if (!Array.isArray(ids)) {
      objectIds = ids ? [new ObjectId(ids)] : [];
      isDeleteAll = !ids && true;
    } else objectIds = ids.map((el) => new ObjectId(el));


    const collection = this.getCollection(relationship.collection);
    const query = {
      [relationship.foreignKey]: { $in: ids },
      [relationship.morphId]: relationship.parentId,
      [relationship.morphType]: relationship.model.name,
    };

    isDeleteAll && delete query[relationship.foreignKey];

    await collection.deleteMany(query);

    return {
      message: "Detach successfully",
    };
  }

  /**
  * @note This method resets the relation lookups.
  * @return {void}
  */
  protected static resetRelation(): void {
    // Clear the $lookups array
    this.$lookups = [];
    this.$relationship = null
  }
}

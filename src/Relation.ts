import {
  IRelationBelongsTo,
  IRelationHasMany,
  IRelationHasOne,
  IRelationOptions,
  IRelationTypes,
} from "./interfaces/IRelation";
import Model from "./Model";
import QueryBuilder from "./QueryBuilder";
import BelongsTo from "./relations/BelongsTo";
import HasMany from "./relations/HasMany";
import HasOne from "./relations/HasOne";

export default class Relation<T> extends QueryBuilder<T> {
  private $alias: string = "";
  private $options: IRelationOptions = {};

  public with(relation: keyof Model<T>, options: IRelationOptions = {}): this {
    if (typeof (this as any)[relation] === "function") {
      this.setAlias(relation as string);
      this.setOptions(options);

      ((this as unknown as Model<T>)[relation] as Function).call(this);
    } else {
      throw new Error(`Relation method ${String(relation)} not found.`);
    }

    return this;
  }

  public hasOne(
    model: typeof Model,
    foreignKey: string,
    localKey: string = "_id"
  ) {
    const hasOne: IRelationHasOne = {
      type: IRelationTypes.hasOne,
      model: this,
      relatedModel: model,
      foreignKey,
      localKey,
      alias: this.$alias,
      options: this.$options,
    };
    const lookup = HasOne.generate(hasOne);
    this.setLookups(lookup);

    const m = model.query();
    return m;
  }

  public belongsTo(
    model: typeof Model,
    foreignKey: string,
    ownerKey: string = "_id"
  ) {
    const belongsTo: IRelationBelongsTo = {
      type: IRelationTypes.belongsTo,
      model: this,
      relatedModel: model,
      foreignKey,
      ownerKey,
      alias: this.$alias,
      options: this.$options,
    };
    const lookup = BelongsTo.generate(belongsTo);

    this.setLookups(lookup);

    const m = model.query();
    return m;
  }

  public hasMany(
    model: typeof Model,
    foreignKey: string,
    localKey: string = "_id"
  ) {
    const hasMany: IRelationHasMany = {
      type: IRelationTypes.hasMany,
      model: this,
      relatedModel: model,
      foreignKey,
      localKey,
      alias: this.$alias,
      options: this.$options,
    };

    const lookup = HasMany.generate(hasMany);
    this.setLookups(lookup);

    const m = model.query();
    m.setRelationship(hasMany);

    return m;
  }

  private setAlias(alias: string): void {
    this.$alias = alias;
  }

  private setOptions(options: IRelationOptions): void {
    this.$options = options;
  }
}

import {
  IRelationBelongsTo,
  IRelationHasOne,
  IRelationOptions,
  IRelationTypes,
} from "./interfaces/IRelation";
import Model from "./Model";
import QueryBuilder from "./QueryBuilder";
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

  hasOne(model: typeof Model, foreignKey: string, localKey: string = "_id") {
    const m = model.query();

    const hasOne: IRelationHasOne = {
      type: IRelationTypes.hasOne,
      model: this,
      relatedModel: m,
      foreignKey,
      localKey,
      alias: this.$alias,
      options: this.$options,
    };
    const lookup = HasOne.generate(hasOne);
    this.setLookups(lookup);

    m.setRelationship(hasOne);
    return m;
  }

  private setAlias(alias: string): void {
    this.$alias = alias;
  }

  private setOptions(options: IRelationOptions): void {
    this.$options = options;
  }
}

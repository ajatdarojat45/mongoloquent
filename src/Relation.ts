import {
  IRelationBelongsTo,
  IRelationHasMany,
  IRelationHasManyThrough,
  IRelationHasOne,
  IRelationOptions,
  IRelationTypes,
} from "./interfaces/IRelation";
import Model from "./Model";
import QueryBuilder from "./QueryBuilder";
import BelongsTo from "./relations/BelongsTo";
import HasMany from "./relations/HasMany";
import HasManyThrough from "./relations/HasManyThrough";
import HasOne from "./relations/HasOne";

export default class Relation<T> extends QueryBuilder<T> {
  private $alias: string = "";
  private $options: IRelationOptions = {};

  private setAlias(alias: string): void {
    this.$alias = alias;
  }

  private setOptions(options: IRelationOptions): void {
    this.$options = options;
  }
}

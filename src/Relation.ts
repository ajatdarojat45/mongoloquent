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
  protected $alias: string = "";
  protected $options: IRelationOptions = {};
}

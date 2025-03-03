import { ObjectId } from "mongodb";
import Model from "../Model";

export enum IRelationTypes {
  hasOne = "hasOne",
  belongsTo = "belongsTo",
  hasMany = "hasMany",
  belongsToMany = "belongsToMany",
  hasManyThrough = "hasManyThrough",
  morphTo = "morphTo",
  morphMany = "morphMany",
  morphToMany = "morphToMany",
  morphByMany = "morphByMany",
}

export interface IRelationOptions {
  select?: string | string[];
  exclude?: string | string[];
}

export interface IRelationHasMany {
  type: IRelationTypes.hasMany;
  model: typeof Model;
  foreignKey: string;
  localKey: string;
  parentId: string | ObjectId | null;
}

export interface IRelationBelongsToMany {
  type: IRelationTypes.belongsToMany;
  model: typeof Model;
  pivot: typeof Model;
  foreignPivotKey: string;
  relatedPivotKey: string;
  parentKey: string;
  relatedKey: string;
  parentId: string | ObjectId | null;
}

export interface IRelationHasManyThrough {
  type: IRelationTypes.hasManyThrough;
  model: typeof Model;
  through: typeof Model;
  firstKey: string;
  secondKey: string;
  localKey: string;
  secondLocalKey: string;
  parentId: string | ObjectId | null;
}

export interface IRelationMorphMany {
  type: IRelationTypes.morphMany;
  model: typeof Model;
  modelName: string;
  morphType: string;
  morphId: string;
  parentId: string | ObjectId | null;
}

export interface IRelationMorphTo {
  type: IRelationTypes.morphTo;
  model: typeof Model;
  modelName: string;
  morphType: string;
  morphId: string;
  parentId: string | ObjectId | null;
}

export interface IRelationMorphToMany {
  type: IRelationTypes.morphToMany;
  model: typeof Model;
  foreignKey: string;
  collection: string;
  morphType: string;
  morphId: string;
  ownerKey: string;
  parentId: string | ObjectId | null;
}

export interface IRelationMorphByMany {
  type: IRelationTypes.morphByMany;
  model: typeof Model;
  collection: string;
  morphType: string;
  morphId: string;
  ownerKey: string;
  foreignKey: string;
  parentId: string | ObjectId | null;
}

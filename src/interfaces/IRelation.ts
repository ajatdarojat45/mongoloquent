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
  morphedByMany = "morphedByMany",
}

export interface IRelationOptions {
  select?: string | string[];
  exclude?: string | string[];
}

export interface IRelationHasOne {
  type: IRelationTypes.hasOne;
  model: typeof Model;
  foreignKey: string;
  localKey: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string;
}

export interface IRelationBelongsTo {
  type: IRelationTypes.belongsTo;
  model: typeof Model;
  foreignKey: string;
  ownerKey: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string;
}

export interface IRelationHasMany {
  type: IRelationTypes.hasMany;
  model: typeof Model;
  foreignKey: string;
  localKey: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string;
}

export interface IRelationHasManyThrough {
  type: IRelationTypes.hasManyThrough;
  model: typeof Model;
  throughModel: typeof Model;
  foreignKey: string;
  foreignKeyThrough: string;
  localKey: string;
  localKeyThrough: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string
}

export interface IRelationBelongsToMany {
  type: IRelationTypes.belongsToMany;
  model: typeof Model;
  pivotModel: typeof Model;
  foreignPivotKey: string;
  relatedPivotKey: string;
  parentKey: string;
  relatedKey: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string;
}

export interface IRelationMorphTo {
  type: IRelationTypes.morphTo;
  model: typeof Model;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string
}

export interface IRelationMorphMany {
  type: IRelationTypes.morphMany;
  model: typeof Model;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string
}

export interface IRelationMorphToMany {
  type: IRelationTypes.morphToMany;
  model: typeof Model;
  foreignKey: string;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string
}

export interface IRelationMorphedByMany {
  type: IRelationTypes.morphedByMany;
  model: typeof Model;
  foreignKey: string;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;
  alias: string;
  options: IRelationOptions;
  parentId: string | ObjectId | null;
  parentModelName: string;
  parentCollectionName: string;
}

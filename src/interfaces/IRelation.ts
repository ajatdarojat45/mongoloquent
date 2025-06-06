import { ObjectId } from "mongodb";

import DB from "../DB";
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
  sort?: [string, "asc" | "desc"];
  skip?: number;
  limit?: number;
}

export interface IRelationHasOne {
  type: IRelationTypes.hasOne;
  model: Model<any>;
  relatedModel: Model<any>;
  foreignKey: string;
  localKey: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationBelongsTo {
  type: IRelationTypes.belongsTo;
  model: Model<any>;
  relatedModel: Model<any>;
  foreignKey: string;
  ownerKey: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationHasMany {
  type: IRelationTypes.hasMany;
  model: Model<any>;
  relatedModel: Model<any>;
  foreignKey: string;
  localKey: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationHasManyThrough {
  type: IRelationTypes.hasManyThrough;
  model: Model<any>;
  relatedModel: Model<any>;
  throughModel: Model<any>;
  foreignKey: string;
  foreignKeyThrough: string;
  localKey: string;
  localKeyThrough: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationBelongsToMany {
  type: IRelationTypes.belongsToMany;
  model: Model<any>;
  relatedModel: Model<any>;
  pivotModel: Model<any>;
  foreignPivotKey: string;
  relatedPivotKey: string;
  parentKey: string;
  relatedKey: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationMorphTo {
  type: IRelationTypes.morphTo;
  model: Model<any>;
  relatedModel: Model<any>;
  morph: string;
  morphId: string;
  morphType: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationMorphMany {
  type: IRelationTypes.morphMany;
  model: Model<any>;
  relatedModel: Model<any>;
  morph: string;
  morphId: string;
  morphType: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationMorphToMany {
  type: IRelationTypes.morphToMany;
  model: Model<any>;
  relatedModel: Model<any>;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

export interface IRelationMorphedByMany {
  type: IRelationTypes.morphedByMany;
  model: Model<any>;
  relatedModel: Model<any>;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;
  alias: string;
  options: IRelationOptions;
  nested?: string[];
}

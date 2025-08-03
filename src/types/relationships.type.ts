import { Model } from "../core";

export enum IRelationshipTypes {
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

export interface IRelationshipOptions {
	select?: string | string[];
	exclude?: string | string[];
	sort?: [string, "asc" | "desc"];
	skip?: number;
	limit?: number;
}

export interface IRelationshipHasOne {
	type: IRelationshipTypes.hasOne;
	model: Model;
	relatedModel: Model;
	foreignKey: string;
	localKey: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipBelongsTo {
	type: IRelationshipTypes.belongsTo;
	model: Model;
	relatedModel: Model;
	foreignKey: string;
	ownerKey: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipHasMany {
	type: IRelationshipTypes.hasMany;
	model: Model;
	relatedModel: Model;
	foreignKey: string;
	localKey: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipHasManyThrough {
	type: IRelationshipTypes.hasManyThrough;
	model: Model;
	relatedModel: Model;
	throughModel: Model;
	foreignKey: string;
	foreignKeyThrough: string;
	localKey: string;
	localKeyThrough: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipBelongsToMany {
	type: IRelationshipTypes.belongsToMany;
	model: Model;
	relatedModel: Model;
	pivotModel: Model;
	foreignPivotKey: string;
	relatedPivotKey: string;
	parentKey: string;
	relatedKey: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipMorphTo {
	type: IRelationshipTypes.morphTo;
	model: Model;
	relatedModel: Model;
	morph: string;
	morphId: string;
	morphType: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipMorphMany {
	type: IRelationshipTypes.morphMany;
	model: Model;
	relatedModel: Model;
	morph: string;
	morphId: string;
	morphType: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipMorphToMany {
	type: IRelationshipTypes.morphToMany;
	model: Model;
	relatedModel: Model;
	morph: string;
	morphId: string;
	morphType: string;
	morphCollectionName: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

export interface IRelationshipMorphedByMany {
	type: IRelationshipTypes.morphedByMany;
	model: Model;
	relatedModel: Model;
	morph: string;
	morphId: string;
	morphType: string;
	morphCollectionName: string;
	alias: string;
	options: IRelationshipOptions;
	nested?: string[];
}

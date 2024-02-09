import Model from "../database/Model";

export interface RelationInterface {}

export interface WithOptionsInterface {
  select?: string[];
  exclude?: string[];
}

export interface BelongsToInterface {
  collection: string;
  foreignKey: string;
  localKey: string;
  type: string;
  model?: typeof Model | string;
}

export interface GenerateBelongsToInterface extends BelongsToInterface {
  alias: string;
  options: {
    select?: string[];
    exclude?: string[];
  };
}

export interface BelongsToManyInterface extends BelongsToInterface {
  pivotCollection: string;
}

export interface GenerateBelongsToManyInterface
  extends GenerateBelongsToInterface {
  pivotCollection: string;
}

export interface HasManyThroughInterface extends BelongsToInterface {
  throughCollection: string;
}

export interface GenerateHasManyThroughInterface
  extends GenerateBelongsToInterface {
  throughCollection: string;
}

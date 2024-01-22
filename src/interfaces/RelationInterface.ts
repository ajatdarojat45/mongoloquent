export interface WithOptionsInterface {
  exclude?: string[];
  include?: string[];
}

export interface BelongsToInterface {
  collection: string;
  foreignKey: string;
  localKey: string;
  type: string;
}

export interface GenerateBelongsToInterface extends BelongsToInterface {
  alias: string;
  options: {
    include?: string[];
    exclude?: string[];
  };
}

export interface BelongsToManyInterface extends BelongsToInterface {
  pivotCollection: string;
  attach: (ids: string[]) => void;
  detach: (ids: string[]) => void;
  sync: (ids: string[]) => void;
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

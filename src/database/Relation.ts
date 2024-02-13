import Query from "./Query";
import {
  RelationInterface,
  WithOptionsInterface,
  BelongsToInterface,
  GenerateBelongsToInterface,
  BelongsToManyInterface,
  GenerateBelongsToManyInterface,
  HasManyThroughInterface,
  GenerateHasManyThroughInterface,
} from "../interfaces/RelationInterface";
import Model from "./Model";

class Relation extends Query implements RelationInterface {
  protected static lookups: object[] = [];

  public static with<T extends typeof Relation>(
    this: T,
    relation: string,
    options: WithOptionsInterface = {}
  ): T {
    if (typeof (this as any)[relation] === "function") {
      const model = (this as any)[relation]();

      const payload = {
        ...model,
        alias: relation,
        options,
      };

      switch (model.type) {
        case "belongsTo":
          return this.generateBelongsTo(payload);
        case "hasMany":
          return this.generateHasMany(payload);
        case "belongsToMany":
          return this.generateBelongsToMany(payload);
        case "hasManyThrough":
          return this.generateHasManyThrough(payload);
      }
    } else {
      console.log(
        `The ${relation} method does not exist in the ${this.name} model.`
      );
    }

    return this;
  }

  public static has<T extends typeof Relation>(
    this: T,
    relation: string,
    options: WithOptionsInterface = {}
  ): T {
    return this.with(relation, options);
  }

  protected static belongsTo(
    model: typeof Model | string,
    foreignKey: string,
    ownerKey: string = "_id"
  ): BelongsToInterface {
    const collection = typeof model === "string" ? model : model.collection;

    return {
      collection,
      foreignKey: ownerKey,
      localKey: foreignKey,
      type: "belongsTo",
      model: model,
    };
  }

  protected static generateBelongsTo<T extends typeof Relation>(
    this: T,
    params: GenerateBelongsToInterface
  ): T {
    const { collection, foreignKey, localKey, alias, model } = params;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let _foreignKey = foreignKey;
    let _localKey = localKey;

    if (this.fields.length > 0) {
      _localKey = `document.${_localKey}`;
    }

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    const lookup = {
      from: collection,
      localField: `${_localKey}`,
      foreignField: `${_foreignKey}`,
      as: alias,
      pipeline: pipeline,
    };

    _lookups.push({
      $lookup: lookup,
    });

    const _unwind = {
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    _lookups.push(_unwind);

    this.lookups = _lookups;
    this.selectFields(params);

    return this;
  }

  protected static hasMany(
    model: typeof Model | string,
    foreignKey: string,
    localKey: string = "_id"
  ): BelongsToInterface {
    const collection = typeof model === "string" ? model : model.collection;
    return {
      collection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "hasMany",
      model: model,
    };
  }

  protected static generateHasMany<T extends typeof Relation>(
    this: T,
    params: GenerateBelongsToInterface
  ): T {
    const { collection, foreignKey, localKey, alias, model } = params;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    const lookup = {
      from: collection,
      localField: localKey,
      foreignField: foreignKey,
      as: alias,
      pipeline: pipeline,
    };

    _lookups.push({ $lookup: lookup });

    this.lookups = _lookups;
    this.selectFields(params);

    return this;
  }

  protected static belongsToMany(
    model: typeof Model | string,
    pivotModel: typeof Model | string,
    foreignKey: string,
    foreignKeyTarget: string
  ): BelongsToManyInterface {
    const collection = typeof model === "string" ? model : model.collection;
    const pivotCollection =
      typeof pivotModel === "string" ? pivotModel : pivotModel.collection;

    return {
      collection,
      pivotCollection,
      foreignKey: foreignKey,
      localKey: foreignKeyTarget,
      type: "belongsToMany",
      model,
    };
  }

  protected static generateBelongsToMany<T extends typeof Relation>(
    this: T,
    params: GenerateBelongsToManyInterface
  ): T {
    const { collection, pivotCollection, foreignKey, localKey, alias, model } =
      params;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    _lookups.push(
      {
        $lookup: {
          from: pivotCollection,
          localField: "_id",
          foreignField: foreignKey,
          as: "pivot",
          pipeline,
        },
      },
      {
        $lookup: {
          from: collection,
          localField: `pivot.${localKey}`,
          foreignField: "_id",
          as: alias,
          //         pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookups = _lookups;
    this.selectFields(params);
    return this;
  }

  protected static hasManyThrough(
    model: typeof Model | string,
    throughModel: typeof Model | string,
    foreignKey: string,
    foreignKeyThrough: string
  ): HasManyThroughInterface {
    const collection = typeof model === "string" ? model : model.collection;
    const throughCollection =
      typeof throughModel === "string" ? throughModel : throughModel.collection;

    return {
      collection,
      throughCollection,
      foreignKey: foreignKeyThrough,
      localKey: foreignKey,
      type: "hasManyThrough",
      model: model,
    };
  }

  protected static generateHasManyThrough<T extends typeof Relation>(
    this: T,
    params: GenerateHasManyThroughInterface
  ): T {
    const {
      collection,
      throughCollection,
      foreignKey,
      localKey,
      alias,
      model,
    } = params;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    _lookups.push(
      {
        $lookup: {
          from: throughCollection,
          localField: "_id",
          foreignField: localKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: collection,
          localField: "pivot._id",
          foreignField: `${foreignKey}`,
          as: alias,
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookups = _lookups;
    this.selectFields(params);
    return this;
  }

  protected static selectFields(params: GenerateBelongsToInterface) {
    const { alias, options } = params;

    if (options?.select && options?.select?.length > 0) {
      let project = {
        $project: {
          document: "$$ROOT",
        },
      };

      options?.select?.forEach((field) => {
        project = {
          ...project,
          $project: {
            ...project.$project,
            [`${alias}.${field}`]: 1,
          },
        };
      });

      const additionals = [
        {
          $set: {
            [`document.${alias}`]: `$${alias}`,
          },
        },
        {
          $replaceRoot: {
            newRoot: "$document",
          },
        },
      ];

      this.lookups.push(project, ...additionals);
    }

    if (options?.exclude && options?.exclude?.length > 0) {
      let project = {
        $project: {},
      };

      options?.exclude?.forEach((field) => {
        project = {
          ...project,
          $project: {
            ...project.$project,
            [`${alias}.${field}`]: 0,
          },
        };
      });

      this.lookups.push(project);
    }

    return this;
  }

  public static resetRelation() {
    this.lookups = [];
    return this;
  }
}

export default Relation;

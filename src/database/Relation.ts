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

class Relation extends Query implements RelationInterface {
  protected static lookup: object[] = [];

  static with<T extends typeof Relation>(
    this: T,
    method: string,
    options: WithOptionsInterface = {}
  ): T {
    if (typeof (this as any)[method] === "function") {
      const model = (this as any)[method]();

      const payload = {
        ...model,
        alias: method,
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
        default:
          return this;
      }
    } else {
      console.log(
        `The ${method} relation method does not exist in the ${this.name} model.`
      );

      return this;
    }
  }

  protected static has<T extends typeof Relation>(
    this: T,
    method: string,
    options: WithOptionsInterface = {}
  ): T {
    return this.with(method, options);
  }

  protected static belongsTo(
    collection: string,
    foreignKey: string,
    ownerKey: string = "_id"
  ): BelongsToInterface {
    return {
      collection: collection,
      foreignKey: ownerKey,
      localKey: foreignKey,
      type: "belongsTo",
    };
  }

  protected static generateBelongsTo<T extends typeof Relation>(
    this: T,
    params: GenerateBelongsToInterface
  ): T {
    const { collection, foreignKey, localKey, alias } = params;
    const _lookup = JSON.parse(JSON.stringify(this.lookup));

    const _foreignKey = this.fields.length > 0 ? foreignKey : localKey;
    const _localKey = this.fields.length > 0 ? localKey : foreignKey;

    _lookup.push({
      $lookup: {
        from: collection,
        localField: `document.${_localKey}`,
        foreignField: _foreignKey,
        as: alias,
      },
    });

    const _unwind = {
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    _lookup.push(_unwind);

    this.lookup = _lookup;
    this.selectFields(params);

    return this;
  }

  static hasMany(
    collection: string,
    foreignKey: string,
    localKey: string = "_id"
  ): BelongsToInterface {
    return {
      collection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "hasMany",
    };
  }

  protected static generateHasMany<T extends typeof Relation>(
    this: T,
    params: GenerateBelongsToInterface
  ): T {
    const { collection, foreignKey, localKey, alias } = params;
    const _lookup = JSON.parse(JSON.stringify(this.lookup));

    _lookup.push({
      $lookup: {
        from: collection,
        localField: localKey,
        foreignField: foreignKey,
        as: alias,
      },
    });

    this.lookup = _lookup;
    this.selectFields(params);

    return this;
  }

  static belongsToMany(
    collection: string,
    pivotCollection: string,
    foreignKey: string,
    foreignKeyTarget: string
  ): BelongsToManyInterface {
    return {
      collection,
      pivotCollection,
      foreignKey: foreignKey,
      localKey: foreignKeyTarget,
      type: "belongsToMany",
      attach: (ids: string[] = []) => this.attach(ids),
      detach: (ids: string[] = []) => this.detach(ids),
      sync: (ids: string[] = []) => this.sync(ids),
    };
  }

  protected static generateBelongsToMany<T extends typeof Relation>(
    this: T,
    params: GenerateBelongsToManyInterface
  ): T {
    const { collection, pivotCollection, foreignKey, localKey, alias } = params;
    const _lookup = JSON.parse(JSON.stringify(this.lookup));

    _lookup.push(
      {
        $lookup: {
          from: pivotCollection,
          localField: "_id",
          foreignField: foreignKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: collection,
          localField: `pivot.${localKey}`,
          foreignField: "_id",
          as: alias,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookup = _lookup;
    this.selectFields(params);
    return this;
  }

  static hasManyThrogh(
    collection: string,
    throughCollection: string,
    foreignKey: string,
    foreignKeyThrough: string
  ): HasManyThroughInterface {
    return {
      collection,
      throughCollection,
      foreignKey: foreignKeyThrough,
      localKey: foreignKey,
      type: "hasManyThrough",
    };
  }

  protected static generateHasManyThrough<T extends typeof Relation>(
    this: T,
    params: GenerateHasManyThroughInterface
  ): T {
    const { collection, throughCollection, foreignKey, localKey, alias } =
      params;
    const _lookup = JSON.parse(JSON.stringify(this.lookup));

    _lookup.push(
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
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookup = _lookup;
    this.selectFields(params);
    return this;
  }

  protected static selectFields(params: GenerateBelongsToInterface) {
    const { alias, options } = params;

    if (options?.include && options?.include?.length > 0) {
      let project = {
        $project: {
          document: "$$ROOT",
        },
      };

      options?.include?.forEach((field) => {
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

      this.lookup.push(project, ...additionals);
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

      this.lookup.push(project);
    }

    return this;
  }

  protected static attach(ids: string[] = []) {
    console.log("attach", "<<<<");
    return this;
  }

  protected static detach(ids: string[] = []) {
    console.log("detach", "<<<<");
    return this;
  }

  protected static sync(ids: string[] = []) {
    console.log("sync", "<<<<");
    return this;
  }

  protected static resetRelation() {
    this.lookup = [];
    return this;
  }
}

export default Relation;

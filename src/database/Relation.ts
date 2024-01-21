import Query from "./Query";

interface WithOptionsInterface {
  exclude?: string[];
  include?: string[];
}

interface BelongsToInterface {
  collection: string;
  foreignKey: string;
  localKey: string;
  type: string;
}

interface GenerateBelongsToInterface extends BelongsToInterface {
  alias: string;
  options: {
    include?: string[];
    exclude?: string[];
  };
}

interface BelongsToManyInterface extends BelongsToInterface {
  pivotCollection: string;
  attach: (ids: string[]) => void;
  detach: (ids: string[]) => void;
  sync: (ids: string[]) => void;
}

interface GenerateBelongsToManyInterface extends GenerateBelongsToInterface {
  pivotCollection: string;
}

interface HasManyThroughInterface extends BelongsToInterface {
  throughCollection: string;
}

interface GenerateHasManyThroughInterface extends GenerateBelongsToInterface {
  throughCollection: string;
}

class Relation extends Query {
  protected static lookup: object[] = [];

  protected static with(
    method: string,
    options: WithOptionsInterface = {}
  ): Relation {
    if (typeof (this as any)[method] === "function") {
      const model = (this as any)[method]();

      const payload = {
        ...model,
        alias: method,
        options,
      };

      if (model.type === "belongsTo") {
        return this.generateBelongsTo(payload);
      }

      if (model.type === "hasMany") {
        return this.generateHasMany(payload);
      }

      if (model.type === "belongsToMany") {
        return this.generateBelongsToMany(payload);
      }

      if (model.type === "hasManyThrough") {
        return this.generateHasManyThrough(payload);
      }

      return this;
    } else {
      console.log(
        `The ${method} relation method does not exist in the ${this.name} model.`
      );

      return this;
    }
  }

  protected static has(
    method: string,
    options: WithOptionsInterface = {}
  ): Relation {
    return this.with(method, options);
  }

  protected static belongsTo(
    collection: string,
    foreignKey: string,
    localKey: string = "_id"
  ): BelongsToInterface {
    return {
      collection: collection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "belongsTo",
    };
  }

  protected static generateBelongsTo(
    params: GenerateBelongsToInterface
  ): Relation {
    const { collection, foreignKey, localKey, alias } = params;

    this.lookup = JSON.parse(
      JSON.stringify([
        ...this.lookup,
        {
          $lookup: {
            from: collection,
            localField: `document.${foreignKey}`,
            foreignField: localKey,
            as: alias,
          },
        },
      ])
    );

    const _unwind = {
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    this?.lookup?.push(_unwind);

    this.selectFields(params);

    return this;
  }

  protected static hasMany(
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

  protected static generateHasMany(
    params: GenerateBelongsToInterface
  ): Relation {
    const { collection, foreignKey, localKey, alias } = params;

    this.lookup = JSON.parse(
      JSON.stringify([
        ...this.lookup,
        {
          $lookup: {
            from: collection,
            localField: localKey,
            foreignField: foreignKey,
            as: alias,
          },
        },
      ])
    );

    this.selectFields(params);

    return this;
  }

  protected static belongsToMany(
    collection: string,
    pivotCollection: string,
    foreignKey: string,
    localKey = "_id"
  ): BelongsToManyInterface {
    return {
      collection,
      pivotCollection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "belongsToMany",
      attach: (ids: string[] = []) => this.attach(ids),
      detach: (ids: string[] = []) => this.detach(ids),
      sync: (ids: string[] = []) => this.sync(ids),
    };
  }

  protected static generateBelongsToMany(
    params: GenerateBelongsToManyInterface
  ): Relation {
    const { collection, pivotCollection, foreignKey, localKey, alias } = params;

    this.lookup = JSON.parse(
      JSON.stringify([
        ...this.lookup,
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
        },
      ])
    );

    this.selectFields(params);
    return this;
  }

  protected static hasManyThrogh(
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

  protected static generateHasManyThrough(
    params: GenerateHasManyThroughInterface
  ): Relation {
    const { collection, throughCollection, foreignKey, localKey, alias } =
      params;

    this.lookup = JSON.parse(
      JSON.stringify([
        ...this.lookup,
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
        },
      ])
    );

    this.selectFields(params);
    return this;
  }

  protected static selectFields(params: GenerateBelongsToInterface): Relation {
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

  protected static attach(ids: string[] = []): Relation {
    console.log("attach", "<<<<");
    return this;
  }

  protected static detach(ids: string[] = []): Relation {
    console.log("detach", "<<<<");
    return this;
  }

  protected static sync(ids: string[] = []): Relation {
    console.log("sync", "<<<<");
    return this;
  }

  protected static resetRelation(): Relation {
    this.lookup = [];
    return this;
  }
}

export default Relation;

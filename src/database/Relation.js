const Query = require("./Query");

class Relation extends Query {
  static lookup = [];

  static with(method, options = {}) {
    try {
      const model = this[method]();
      const payload = {
        ...model,
        alias: method,
        options,
      };

      if (model.type === "one" || model.type === "many")
        this.generateRelation(payload);

      if (model.type === "belongsToMany") {
        this.generateBelongsToMany(payload);
      }

      return this;
    } catch (error) {
      throw new Error(
        `The ${method} relationship method does not exist in the ${this.name} model.`
      );
    }
  }

  static belongsTo(collection, foreignKey, localKey = "_id") {
    return {
      collection: collection,
      foreignKey: localKey,
      localKey: foreignKey,
      type: "one",
    };
  }

  static hasMany(collection, foreignKey, localKey = "_id") {
    return {
      collection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "many",
    };
  }

  static belongsToMany(
    collection,
    pivotCollection,
    foreignKey,
    localKey = "_id"
  ) {
    return {
      collection,
      pivotCollection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "belongsToMany",
      attach: (ids) => this.attach(ids),
    };
  }

  static generateBelongsToMany(params) {
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

  static generateRelation(params) {
    const { collection, foreignKey, localKey, type, alias } = params;

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

    if (type === "one") {
      this.lookup.push({
        $unwind: {
          path: `$${alias}`,
          preserveNullAndEmptyArrays: true,
        },
      });
    }

    this.selectFields(params);

    return this;
  }

  static selectFields(params) {
    const { alias, options } = params;

    if (options?.include?.length > 0) {
      const project = {
        $project: {
          document: "$$ROOT",
        },
      };

      options?.include?.forEach((field) => {
        project.$project[`${alias}.${field}`] = 1;
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

    if (options?.exclude?.length > 0) {
      const project = {
        $project: {},
      };

      options?.exclude?.forEach((field) => {
        project.$project[`${alias}.${field}`] = 0;
      });

      this.lookup.push(project);
    }

    return this;
  }

  static attach() {
    console.log("attach", "<<<<");
  }

  static detach() {
    console.log("detach", "<<<<");
  }

  static sync() {
    console.log("sync", "<<<<");
  }

  static resetRelation() {
    this.lookup = [];
  }
}

module.exports = Relation;

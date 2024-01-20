const Query = require("./Query");

class Relation extends Query {
  static lookup = [];

  static with(method, options = {}) {
    try {
      const model = this[method]();
      this.generateRelation({
        ...model,
        alias: method,
        options,
      });

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

  static generateRelation({
    collection,
    foreignKey,
    localKey,
    type,
    alias,
    options,
  }) {
    this.lookup.push({
      $lookup: {
        from: collection,
        localField: localKey,
        foreignField: foreignKey,
        as: alias,
      },
    });

    if (type === "one") {
      this.lookup.push({
        $unwind: {
          path: `$${alias}`,
          preserveNullAndEmptyArrays: true,
        },
      });
    }

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

  static resetRelation() {
    this.lookup = [];
  }
}

module.exports = Relation;

const Query = require("./Query");

class Relation extends Query {
  static lookup = [];

  static with(method) {
    const model = this[method]();

    this.generateLookup({
      ...model,
      alias: method,
    });

    return this;
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

  static generateLookup({ collection, foreignKey, localKey, type, alias }) {
    this.lookup.push({
      $lookup: {
        from: collection,
        localField: localKey,
        foreignField: foreignKey,
        as: alias,
      },
    });

    if (type === "one") {
      this.push({
        $unwind: {
          path: `$${alias}`,
          preserveNullAndEmptyArrays: true,
        },
      });
    }

    return this;
  }

  static resetRelation() {
    this.lookup = [];
  }
}

module.exports = Relation;

const dayjs = require("../utils/dayjs");

class Relation {
  static with(model, alias, lookup = []) {
    const _lookup = [...lookup];

    _lookup.push({
      $lookup: {
        from: model.collection,
        localField: model.localKey,
        foreignField: model.foreignKey,
        as: alias,
      },
    });

    if (model.type === "one") {
      _lookup.push({
        $unwind: {
          path: `$${alias}`,
          preserveNullAndEmptyArrays: true,
        },
      });
    }

    return _lookup;
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
}

module.exports = Relation;

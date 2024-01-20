const Database = require("./Database");

class Query extends Database {
  static isWithTrased = false;
  static isOnlyTrased = false;
  static limit = 0;
  static perPage = 10;

  static sort = [
    {
      $project: {
        document: "$$ROOT",
      },
    },
    {
      $sort: {},
    },
    {
      $replaceRoot: {
        newRoot: "$document",
      },
    },
  ];

  static queries = {
    $match: {
      $and: [],
      $or: [],
    },
  };

  static fields = {
    $project: {},
  };

  static orderBy(field, order) {
    const _field = field;
    const _order = order.toLowerCase() === "desc" ? -1 : 1;

    this.sort[0].$project[`${_field}`] = 1;
    this.sort[0].$project[`lowercase_${_field}`] = { $toLower: `$${_field}` };
    this.sort[1].$sort[`lowercase_${_field}`] = _order;

    return this;
  }

  static select(fields = []) {
    if (fields.length > 0) {
      fields.forEach((field) => {
        this.fields.$project[field] = 1;
      });
    }
    return this;
  }

  static exclude(fields = []) {
    if (fields.length > 0) {
      fields.forEach((field) => {
        this.fields.$project[field] = 0;
      });
    }

    return this;
  }

  static where(field, operator, value = "") {
    let _value = value;
    let _operator = operator;

    if (value === "") {
      _value = operator;
      _operator = "eq";
    }

    this.queries.$match.$and.push({
      [field]: {
        [`$${_operator}`]: _value,
      },
    });

    return this;
  }

  static orWhere(field, operator, value = "") {
    let _value = value;
    let _operator = operator;

    if (value === "") {
      _value = operator;
      _operator = "eq";
    }

    this.queries.$match.$or.push({
      [field]: {
        [`$${_operator}`]: _value,
      },
    });

    return this;
  }

  static take(limit) {
    this.limit = limit;
    return this;
  }

  static generateQuery() {
    if (this.softDelete) {
      this.queries.$match.$and.push({
        isDeleted: {
          $eq: false,
        },
      });
    }

    if (this.isOnlyTrashed) {
      this.queries.$match.$and.push({
        isDeleted: {
          $eq: true,
        },
      });
    }

    if (this.isWithTrashed) {
      const $and = this.queries.$match.$and.filter(
        (item) => item.hasOwnProperty("isDeleted") === false
      );

      this.queries.$match.$and = $and;
    }

    if (this?.queries?.$match?.$and?.length === 0) {
      delete this.queries.$match.$and;
    }

    if (this?.queries?.$match?.$or?.length === 0) {
      delete this.queries.$match.$or;
    }

    return this;
  }

  static resetQuery() {
    this.sort = [
      {
        $project: {
          document: "$$ROOT",
        },
      },
      {
        $sort: {},
      },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
    ];

    this.queries = {
      $match: {
        $and: [],
        $or: [],
      },
    };

    this.fields = {
      $project: {},
    };
  }
}

module.exports = Query;
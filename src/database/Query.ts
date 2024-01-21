import Database from "./Database";
import { ObjectId } from "mongodb";

interface QueriesInterface {
  $match?: {
    $and?: object[];
    $or?: object[];
  };
}

class Query extends Database {
  protected static isWithTrashed: boolean = false;
  protected static isOnlyTrashed: boolean = false;
  protected static limit: number = 0;
  protected static perPage: number = 10;

  protected static sort: object[] = [
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

  protected static queries: QueriesInterface = {
    $match: {
      $and: [],
      $or: [],
    },
  };

  protected static fields: object = {
    $project: {
      document: "$$ROOT",
    },
  };

  protected static orderBy(field: string, order: string): Query {
    const _field: string = field;
    const _order: number = order.toLowerCase() === "desc" ? -1 : 1;

    const _sort = JSON.parse(JSON.stringify(this.sort));

    _sort[0].$project[`${_field}`] = 1;
    _sort[0].$project[`lowercase_${_field}`] = { $toLower: `$${_field}` };
    _sort[1].$sort[`lowercase_${_field}`] = _order;

    this.sort = JSON.parse(JSON.stringify(_sort));

    return this;
  }

  protected static select(fields: string | string[] = ""): Query {
    if (typeof fields === "string") {
      const _fields = JSON.parse(JSON.stringify(this.fields));
      _fields.$project[fields] = 1;

      this.fields = JSON.parse(JSON.stringify(_fields));
    } else if (typeof fields !== "string" && fields.length > 0) {
      const _fields = JSON.parse(JSON.stringify(this.fields));

      fields.forEach((field) => {
        _fields.$project[field] = 1;
      });

      this.fields = JSON.parse(JSON.stringify(_fields));
    }

    return this;
  }

  protected static exclude(fields: string | string[] = ""): Query {
    if (typeof fields === "string") {
      const _fields = JSON.parse(JSON.stringify(this.fields));
      _fields.$project[fields] = 0;

      this.fields = JSON.parse(JSON.stringify(_fields));
    } else if (typeof fields !== "string" && fields.length > 0) {
      const _fields = JSON.parse(JSON.stringify(this.fields));

      fields.forEach((field) => {
        _fields.$project[field] = 0;
      });

      this.fields = JSON.parse(JSON.stringify(_fields));
    }

    return this;
  }

  static where<T extends typeof Query>(
    this: T,
    field: string,
    operator: string | number | ObjectId,
    value: string | number | ObjectId = ""
  ): T {
    let _value = value;
    let _operator = operator;

    const _queries = JSON.parse(JSON.stringify(this.queries));

    if (value === "") {
      _value = operator;
      _operator = "eq";
    }

    _queries.$match.$and.push({
      [field]: {
        [`$${_operator}`]: _value,
      },
    });

    this.queries = _queries;

    return this;
  }

  protected static orWhere(
    field: string,
    operator: string | number,
    value: string | number = ""
  ): Query {
    let _value: string | number = value;
    let _operator: string | number = operator;

    const _queries = JSON.parse(JSON.stringify(this.queries));

    if (value === "") {
      _value = operator;
      _operator = "eq";
    }

    _queries.$match.$or.push({
      [field]: {
        [`$${_operator}`]: _value,
      },
    });

    this.queries = JSON.parse(JSON.stringify(_queries));
    return this;
  }

  protected static take(limit: number): Query {
    this.limit = limit;
    return this;
  }

  protected static generateQuery(): Query {
    if (this.softDelete) {
      this?.queries?.$match?.$and?.push({
        isDeleted: {
          $eq: false,
        },
      });
    }

    if (this.isOnlyTrashed) {
      this?.queries?.$match?.$and?.push({
        isDeleted: {
          $eq: true,
        },
      });
    }

    if (this.isWithTrashed) {
      const _and = this?.queries?.$match?.$and?.filter(
        (item) => item.hasOwnProperty("isDeleted") === false
      );

      if (this?.queries?.$match?.$and) {
        this.queries.$match.$and = _and;
      }
    }

    if (this?.queries?.$match?.$and?.length === 0) {
      delete this.queries.$match.$and;
    }

    if (this?.queries?.$match?.$or?.length === 0) {
      delete this.queries.$match.$or;
    }

    return this;
  }

  protected static resetQuery() {
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

export default Query;

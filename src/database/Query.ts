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

  protected static fields: object[] = [
    {
      $project: {
        document: "$$ROOT",
      },
    },
  ];

  static orderBy<T extends typeof Query>(
    this: T,
    field: string,
    order: string
  ): T {
    const _field: string = field;
    const _order: number = order.toLowerCase() === "desc" ? -1 : 1;

    const _sort = JSON.parse(JSON.stringify(this.sort));

    _sort[0].$project[`${_field}`] = 1;
    _sort[0].$project[`lowercase_${_field}`] = { $toLower: `$${_field}` };
    _sort[1].$sort[`lowercase_${_field}`] = _order;

    this.sort = JSON.parse(JSON.stringify(_sort));

    return this;
  }

  static select<T extends typeof Query>(
    this: T,
    fields: string | string[] = ""
  ): T {
    if (typeof fields === "string") {
      let _project = {
        $project: {
          document: "$$ROOT",
        },
      };

      _project = {
        ..._project,
        $project: {
          ..._project.$project,
          [fields]: 1,
        },
      };

      this.fields[0] = _project;
    } else if (typeof fields !== "string" && fields.length > 0) {
      let _project = {
        $project: {
          document: "$$ROOT",
        },
      };

      fields.forEach((field) => {
        _project = {
          ..._project,
          $project: {
            ..._project.$project,
            [field]: 1,
          },
        };
      });

      this.fields[0] = _project;
    }

    return this;
  }

  static exclude<T extends typeof Query>(
    this: T,
    fields: string | string[] = ""
  ): T {
    if (typeof fields === "string") {
      let _project = {};
      _project = {
        ..._project,
        [fields]: 0,
      };

      this.fields.push({
        $project: _project,
      });
    } else if (typeof fields !== "string" && fields.length > 0) {
      let _project = {};
      fields.forEach((field) => {
        _project = {
          ..._project,
          [field]: 0,
        };
      });

      this.fields.push({
        $project: _project,
      });
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

  static orWhere<T extends typeof Query>(
    this: T,
    field: string,
    operator: string | number,
    value: string | number = ""
  ): T {
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

    const _orLength = this?.queries?.$match?.$or?.length || 0;
    const _andLength = this?.queries?.$match?.$and?.length || 0;

    if (_orLength > 0 && _andLength > 0) {
      this?.queries?.$match?.$or?.push({
        $and: this?.queries?.$match?.$and,
      });

      delete this?.queries?.$match?.$and;
    }

    if (_andLength === 0) {
      delete this?.queries?.$match?.$and;
    }

    if (_orLength === 0) {
      delete this?.queries?.$match?.$or;
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

    this.fields = [
      {
        $project: {
          document: "$$ROOT",
        },
      },
    ];
  }
}

export default Query;

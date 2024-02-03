import Database from "./Database";
import { QueriesInterface, QueryInterface } from "../interfaces/QueryInterface";

class Query extends Database implements QueryInterface {
  protected static isWithTrashed: boolean = false;
  protected static isOnlyTrashed: boolean = false;
  protected static $limit: number = 0;
  protected static $skip: number = 0;
  protected static perPage: number = 10;
  protected static groups: object[] = [];
  protected static fields: object[] = [];
  protected static queries: QueriesInterface = {
    $match: {
      $and: [],
      $or: [],
    },
  };

  protected static sorts: object[] = [
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

  private static comparationOperators = [
    {
      operator: "=",
      mongoOperator: "eq",
    },
    {
      operator: "!=",
      mongoOperator: "ne",
    },
    {
      operator: ">",
      mongoOperator: "gt",
    },
    {
      operator: "<",
      mongoOperator: "lt",
    },
    {
      operator: ">=",
      mongoOperator: "gte",
    },
    {
      operator: "<=",
      mongoOperator: "lte",
    },
    {
      operator: "in",
      mongoOperator: "in",
    },
    {
      operator: "notIn",
      mongoOperator: "nin",
    },
    {
      operator: "like",
      mongoOperator: "regex",
      options: "i",
    },
  ];

  static orderBy<T extends typeof Query>(
    this: T,
    field: string,
    order: string
  ): T {
    const _field: string = field;
    const _order: number = order.toLowerCase() === "desc" ? -1 : 1;

    const _sorts = JSON.parse(JSON.stringify(this.sorts));

    _sorts[0].$project[`${_field}`] = 1;
    _sorts[0].$project[`lowercase_${_field}`] = { $toLower: `$${_field}` };
    _sorts[1].$sort[`lowercase_${_field}`] = _order;

    this.sorts = JSON.parse(JSON.stringify(_sorts));

    return this;
  }

  static groupBy<T extends typeof Query>(this: T, field: string): T {
    const _field: string = field;
    const _groups = [...JSON.parse(JSON.stringify(this.groups))];

    if (_groups.length > 0) {
      _groups[0].$group._id[`${_field}`] = `$${_field}`;
    } else {
      _groups.push({
        $group: {
          _id: {
            [`${_field}`]: `$${_field}`,
          },
        },
      });
    }

    this.groups = _groups;
    return this;
  }

  static select<T extends typeof Query>(
    this: T,
    fields: string | string[] = ""
  ): T {
    const _fields = JSON.parse(JSON.stringify(this.fields));
    let _project = {
      $project: {
        document: "$$ROOT",
      },
    };

    if (typeof fields === "string") {
      _project = {
        ..._project,
        $project: {
          ..._project.$project,
          [fields]: 1,
        },
      };
    } else if (typeof fields !== "string" && fields.length > 0) {
      fields.forEach((field) => {
        _project = {
          ..._project,
          $project: {
            ..._project.$project,
            [field]: 1,
          },
        };
      });
    }

    _fields[0] = _project;
    this.fields = _fields;
    return this;
  }

  static exclude<T extends typeof Query>(
    this: T,
    fields: string | string[] = ""
  ): T {
    const _fields = JSON.parse(JSON.stringify(this.fields));
    let _project = {};

    if (typeof fields === "string") {
      _project = {
        ..._project,
        [fields]: 0,
      };

      _fields.push({
        $project: _project,
      });
    } else if (typeof fields !== "string" && fields.length > 0) {
      fields.forEach((field) => {
        _project = {
          ..._project,
          [field]: 0,
        };
      });

      _fields.push({
        $project: _project,
      });
    }

    this.fields = _fields;
    return this;
  }

  static where<T extends typeof Query>(
    this: T,
    field: string,
    operator: any,
    value?: any
  ): T {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    return this.whereGenerator(field, _operator, _value);
  }

  static orWhere<T extends typeof Query>(
    this: T,
    field: string,
    operator: any,
    value?: any
  ): T {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    return this.whereGenerator(field, _operator, _value, true);
  }

  static whereIn<T extends typeof Query>(
    this: T,
    field: string,
    values: any[]
  ): T {
    return this.whereGenerator(field, "in", values);
  }

  static orWhereIn<T extends typeof Query>(
    this: T,
    field: string,
    values: any[]
  ): T {
    return this.whereGenerator(field, "in", values, true);
  }

  static whereNotIn<T extends typeof Query>(
    this: T,
    field: string,
    values: any[]
  ): T {
    return this.whereGenerator(field, "nin", values);
  }

  static orWhereNotIn<T extends typeof Query>(
    this: T,
    field: string,
    values: any[]
  ): T {
    return this.whereGenerator(field, "nin", values, true);
  }

  static whereBetween<T extends typeof Query>(
    this: T,
    field: string,
    values: any[]
  ): T {
    if (values.length !== 2) {
      console.error("The between operator must have two values");
      return this;
    }

    return this.whereGenerator(field, "between", values);
  }

  static orWhereBetween<T extends typeof Query>(
    this: T,
    field: string,
    values: any[]
  ): T {
    if (values.length !== 2) {
      console.error("The between operator must have two values");
      return this;
    }

    return this.whereGenerator(field, "between", values, true);
  }

  static take<T extends typeof Query>(this: T, limit: number): T {
    this.$limit = limit;
    return this;
  }

  static limit<T extends typeof Query>(this: T, limit: number): T {
    this.$limit = limit;
    return this;
  }

  static offset<T extends typeof Query>(this: T, skip: number): T {
    this.$skip = skip;
    return this;
  }

  static skip<T extends typeof Query>(this: T, skip: number): T {
    this.$skip = skip;
    return this;
  }

  private static whereGenerator<T extends typeof Query>(
    this: T,
    field: string,
    operator: string,
    value: any,
    isOr: boolean = false
  ): T {
    let _value = value;
    let _operator = operator;
    const _queries = JSON.parse(JSON.stringify(this.queries));
    let q = {};
    const _logicalOperator = isOr ? "$or" : "$and";

    if (_operator === "between") {
      _queries.$match[_logicalOperator].push({
        [field]: {
          $gte: _value?.[0],
          $lte: _value[1],
        },
      });

      this.queries = _queries;
      return this;
    }

    if (value) {
      const _comparationOperator = this.comparationOperators.find(
        (el) => el.operator === _operator || el.mongoOperator === _operator
      );

      if (_comparationOperator) {
        _operator = _comparationOperator.mongoOperator;
        if (_comparationOperator.mongoOperator === "regex")
          q = { $options: "i" };
      }
    }

    _queries.$match[_logicalOperator].push({
      [field]: {
        [`$${_operator}`]: _value,
        ...q,
      },
    });

    this.queries = _queries;

    return this;
  }

  protected static generateQuery() {
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
    this.sorts = [
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

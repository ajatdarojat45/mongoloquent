class Query {
  static where(condition = {}, key, value) {
    return {
      ...condition,
      [key]: value,
    };
  }

  static orderBy(sort) {
    const result = [
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

    sort.forEach((item) => {
      const _field = item.field.toLowerCase();
      const _order = item.order.toLowerCase() === "desc" ? -1 : 1;

      result[0].$project[`${_field}`] = 1;
      result[0].$project[`lowercase_${_field}`] = { $toLower: `$${_field}` };
      result[1].$sort[`lowercase_${_field}`] = _order;
    });

    return result;
  }

  static buildCondition(condition, criteria) {
    let _condition = condition;

    if (criteria.softDelete) {
      _condition = {
        ..._condition,
        isDeleted: false,
      };
    }

    if (criteria.onlyTrashed) {
      _condition = {
        ..._condition,
        isDeleted: true,
      };
    }

    if (criteria.withTrashed) {
      const { isDeleted, ...rest } = _condition;

      _condition = {
        ...rest,
      };
    }

    return _condition;
  }
}

module.exports = Query;

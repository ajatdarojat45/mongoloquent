class Query {
  static where(condition = {}, key, value) {
    return {
      ...condition,
      [key]: value,
    };
  }

  static orderBy(sort) {
    if (sort.length === 0) {
      return [];
    }

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

  static selecteFields(fields) {
    const result = {
      $project: {},
    };

    fields.forEach((field) => {
      result.$project[field] = 1;
    });

    return result;
  }

  static excludeFields(fields) {
    const result = {
      $project: {},
    };

    fields.forEach((field) => {
      result.$project[field] = 0;
    });

    return result;
  }

  static buildCondition(condition, criteria) {
    let _condition = {
      $match: {
        $and: [],
        $or: [],
      },
    };

    condition.forEach((item) => {
      if (item.logic === "or") {
        _condition.$match.$or.push({
          [item.field]: {
            [`$${item.operator}`]: item.value,
          },
        });
      } else {
        _condition.$match.$and.push({
          [item.field]: {
            [`$${item.operator}`]: item.value,
          },
        });
      }
    });

    if (criteria.softDelete) {
      _condition.$match.$and.push({
        isDeleted: {
          $eq: false,
        },
      });
    }

    if (criteria.onlyTrashed) {
      _condition.$match.$and.push({
        isDeleted: {
          $eq: true,
        },
      });
    }

    if (criteria.withTrashed) {
      const $and = _condition.$match.$and.filter(
        (item) => item.hasOwnProperty("isDeleted") === false
      );

      _condition.$match.$and = $and;
    }

    if (_condition.$match.$and.length === 0) {
      delete _condition.$match.$and;
    }

    if (_condition.$match.$or.length === 0) {
      delete _condition.$match.$or;
    }

    return _condition;
  }
}

module.exports = Query;

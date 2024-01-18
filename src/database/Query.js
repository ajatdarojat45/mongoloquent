class Query {
  static where(condition = {}, key, value) {
    return {
      ...condition,
      [key]: value,
    };
  }

  static orderBy(criteria, order) {
    const _criteria = criteria.toLowerCase();
    const _order = order.toLowerCase() === "desc" ? -1 : 1;

    return {
      [criteria]: _order,
    };
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

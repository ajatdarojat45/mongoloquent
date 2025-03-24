const operators = [
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

export default operators

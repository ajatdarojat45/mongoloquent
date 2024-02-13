import Query from "../../src/database/Query";

beforeEach(() => {
  Query["resetQuery"]();
});

describe("Query - orderBy method", () => {
  test("single orderBy should return this", () => {
    const result = Query.orderBy("name", "asc");

    expect(result).toBe(Query);
    expect(result).toHaveProperty("sorts");
    expect(result["sorts"]).toEqual(expect.any(Array));
    expect(result["sorts"]).toHaveLength(3);
    expect(result["sorts"][1]).toEqual(expect.any(Object));
    expect(result["sorts"][1]).toHaveProperty("$sort");
  });

  test("multiple orderBy should return this", () => {
    const result = Query.orderBy("name", "asc").orderBy("age", "desc");

    expect(result).toBe(Query);
    expect(result).toHaveProperty("sorts");
    expect(result["sorts"]).toEqual(expect.any(Array));
    expect(result["sorts"]).toHaveLength(3);
    expect(result["sorts"][1]).toEqual(expect.any(Object));
    expect(result["sorts"][1]).toHaveProperty("$sort");
  });
});

describe("Query - groupBy method", () => {
  test("single groupBy should return this", () => {
    const result = Query.groupBy("_id");

    expect(result).toBe(Query);

    const groups = result["groups"];
    expect(groups).toEqual(expect.any(Array));
    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual(expect.any(Object));
    expect(groups[0]).toHaveProperty("$group");
  });

  test("multiple groupBy should return this", () => {
    const result = Query.groupBy("_id").groupBy("userId");

    expect(result).toBe(Query);

    const groups = result["groups"];
    expect(groups).toEqual(expect.any(Array));
    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual(expect.any(Object));
    expect(groups[0]).toHaveProperty("$group");
  });
});

describe("Query - select method", () => {
  test("single select should return this", () => {
    const result = Query.select("name");

    expect(result).toBe(Query);

    const fields = result["fields"];
    expect(fields).toEqual(expect.any(Array));
    expect(fields).toHaveLength(1);
    expect(fields[0]).toEqual(expect.any(Object));
    expect(fields[0]).toHaveProperty("$project");
  });

  test("multiple select should return this", () => {
    const result = Query.select(["name", "age"]);

    expect(result).toBe(Query);

    const fields = result["fields"];
    expect(fields).toEqual(expect.any(Array));
    expect(fields).toHaveLength(1);
    expect(fields[0]).toEqual(expect.any(Object));
    expect(fields[0]).toHaveProperty("$project");
  });
});

describe("Query - exclude method", () => {
  test("single exclude should return this", () => {
    const result = Query.exclude("name");

    expect(result).toBe(Query);

    const fields = result["fields"];
    expect(fields).toEqual(expect.any(Array));
    expect(fields).toHaveLength(1);
    expect(fields[0]).toEqual(expect.any(Object));
    expect(fields[0]).toHaveProperty("$project");
  });

  test("multiple exclude should return this", () => {
    const result = Query.exclude(["name", "age"]);

    expect(result).toBe(Query);

    const fields = result["fields"];
    expect(fields).toEqual(expect.any(Array));
    expect(fields).toHaveLength(1);
    expect(fields[0]).toEqual(expect.any(Object));
    expect(fields[0]).toHaveProperty("$project");
  });
});

describe("Query - where method", () => {
  test("single where should return this", () => {
    const result = Query.where("name", "John");

    expect(result).toBe(Query);

    const queries = result["queries"];
    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(1);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("name");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });

  test("multiple where should return this", () => {
    const result = Query.where("name", "John").where("age", 20);

    expect(result).toBe(Query);

    const queries = result["queries"];
    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(2);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("name");
    expect(match?.["$and"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[1]).toHaveProperty("age");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });
});

describe("Query - orWhere method", () => {
  test("single orWhere should return this", () => {
    const result = Query.orWhere("name", "John");

    expect(result).toBe(Query);

    const queries = result["queries"];
    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(1);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("name");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });

  test("multiple orWhere should return this", () => {
    const result = Query.orWhere("name", "Jhon").orWhere("age", 12);

    expect(result).toBe(Query);

    const queries = result["queries"];
    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(2);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("name");
    expect(match?.["$or"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[1]).toHaveProperty("age");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });
});

describe("Query - whereIn method", () => {
  test("single whereIn should return this", () => {
    const result = Query.whereIn("name", ["John", "Doe"]);

    expect(result).toBe(Query);

    const queries = result["queries"];
    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(1);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("name");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });

  test("multiple whereIn should return this", () => {
    const result = Query.whereIn("name", ["John", "Doe"]).whereIn(
      "age",
      [12, 20]
    );

    expect(result).toBe(Query);

    const queries = result["queries"];
    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(2);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("name");
    expect(match?.["$and"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[1]).toHaveProperty("age");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });
});

describe("Query - orWhereIn method", () => {
  test("single orWhereIn should return this", () => {
    const result = Query.orWhereIn("name", ["John", "Doe"]);

    expect(result).toBe(Query);
    expect(result["queries"]).toEqual(expect.any(Object));
    expect(result["queries"]).toHaveProperty("$match");

    const match = result["queries"]["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(1);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("name");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });

  test("multiple orWhereIn should return this", () => {
    const result = Query.orWhereIn("name", ["John", "Doe"]).orWhereIn(
      "age",
      [12, 20]
    );

    expect(result).toBe(Query);
    expect(result["queries"]).toEqual(expect.any(Object));
    expect(result["queries"]).toHaveProperty("$match");

    const match = result["queries"]["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(2);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("name");
    expect(match?.["$or"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[1]).toHaveProperty("age");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });
});

describe("Query - whereNotIn method", () => {
  test("single whereNotIn should return this", () => {
    const result = Query.whereNotIn("name", ["John", "Doe"]);

    expect(result).toBe(Query);

    const queries = result["queries"];

    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(1);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("name");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });

  test("multiple whereNotIn should return this", () => {
    const result = Query.whereNotIn("name", ["John", "Doe"]).whereNotIn(
      "age",
      [12, 20]
    );

    expect(result).toBe(Query);

    const queries = result["queries"];

    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(2);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("name");
    expect(match?.["$and"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[1]).toHaveProperty("age");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });
});

describe("Query - orWhereNotIn method", () => {
  test("single orWhereNotIn should return this", () => {
    const result = Query.orWhereNotIn("name", ["John", "Doe"]);

    expect(result).toBe(Query);
    expect(result["queries"]).toEqual(expect.any(Object));
    expect(result["queries"]).toHaveProperty("$match");

    const match = result["queries"]["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(1);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("name");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });

  test("multiple orWhereNotIn should return this", () => {
    const result = Query.orWhereNotIn("name", ["John", "Doe"]).orWhereNotIn(
      "age",
      [12, 20]
    );

    expect(result).toBe(Query);
    expect(result["queries"]).toEqual(expect.any(Object));
    expect(result["queries"]).toHaveProperty("$match");

    const match = result["queries"]["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(2);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("name");
    expect(match?.["$or"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[1]).toHaveProperty("age");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });
});

describe("Query - whereBetween method", () => {
  test("single whereBetween should return this", () => {
    const result = Query.whereBetween("age", [12, 20]);

    expect(result).toBe(Query);

    const queries = result["queries"];

    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(1);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("age");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });

  test("multiple whereBetween should return this", () => {
    const result = Query.whereBetween("age", [12, 20]).whereBetween(
      "height",
      [4, 6]
    );

    expect(result).toBe(Query);

    const queries = result["queries"];

    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(2);
    expect(match?.["$and"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[0]).toHaveProperty("age");
    expect(match?.["$and"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$and"]?.[1]).toHaveProperty("height");

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });

  test("with single value should return this", () => {
    Query.whereBetween("age", [12]);

    const queries = Query["queries"];

    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$and");
    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);

    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);
  });
});

describe("Query - orWhereBetween method", () => {
  test("single orWhereBetween should return this", () => {
    const result = Query.orWhereBetween("age", [12, 20]);

    expect(result).toBe(Query);
    expect(result["queries"]).toEqual(expect.any(Object));
    expect(result["queries"]).toHaveProperty("$match");

    const match = result["queries"]["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(1);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("age");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });

  test("multiple orWhereBetween should return this", () => {
    const result = Query.orWhereBetween("age", [12, 20]).orWhereBetween(
      "height",
      [4, 6]
    );

    expect(result).toBe(Query);
    expect(result["queries"]).toEqual(expect.any(Object));
    expect(result["queries"]).toHaveProperty("$match");

    const match = result["queries"]["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(2);
    expect(match?.["$or"]?.[0]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[0]).toHaveProperty("age");
    expect(match?.["$or"]?.[1]).toEqual(expect.any(Object));
    expect(match?.["$or"]?.[1]).toHaveProperty("height");

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });

  test("with single value should return this", () => {
    Query.orWhereBetween("age", [12]);

    const queries = Query["queries"];

    expect(queries).toEqual(expect.any(Object));
    expect(queries).toHaveProperty("$match");

    const match = queries["$match"];
    expect(match).toEqual(expect.any(Object));
    expect(match).toHaveProperty("$or");
    expect(match?.["$or"]).toEqual(expect.any(Array));
    expect(match?.["$or"]).toHaveLength(0);

    expect(match?.["$and"]).toEqual(expect.any(Array));
    expect(match?.["$and"]).toHaveLength(0);
  });
});

describe("Query - generateQuery method", () => {
  test("with softDelete", () => {
    Query["softDelete"] = true;
    Query["generateQuery"]();

    expect(Query["queries"]).toEqual(expect.any(Object));
    expect(Query["queries"]).toHaveProperty("$match");
    expect(Query["queries"]["$match"]).toHaveProperty("$and");
    expect(Query["queries"]["$match"]?.["$and"]).toHaveLength(1);
    expect(Query["queries"]["$match"]?.["$and"]?.[0]).toEqual(
      expect.any(Object)
    );
    expect(Query["queries"]["$match"]?.["$and"]?.[0]).toHaveProperty(
      "isDeleted"
    );
  });

  test("without queries", () => {
    Query["queries"] = {};
    Query["generateQuery"]();

    expect(Query["queries"]).toEqual(expect.any(Object));
    expect(Query["queries"]).not.toHaveProperty("$match");
  });

  test("with where and orWhere", () => {
    Query.where("name", "John").orWhere("age", 20);
    Query["generateQuery"]();

    expect(Query["queries"]).toEqual(expect.any(Object));
    expect(Query["queries"]).toHaveProperty("$match");
    expect(Query["queries"]["$match"]).toHaveProperty("$or");
    expect(Query["queries"]["$match"]?.["$or"]).toHaveLength(2);
    expect(Query["queries"]["$match"]?.["$or"]?.[0]).toEqual(
      expect.any(Object)
    );
    expect(Query["queries"]["$match"]?.["$or"]?.[0]).toHaveProperty("age");
    expect(Query["queries"]["$match"]?.["$or"]?.[1]).toEqual(
      expect.any(Object)
    );
    expect(Query["queries"]["$match"]?.["$or"]?.[1]).toHaveProperty("$and");
    expect(Query["queries"]["$match"]).not.toHaveProperty("$and");
  });

  test("with isOnlyTrashed", () => {
    Query["isOnlyTrashed"] = true;
    Query["generateQuery"]();

    expect(Query["queries"]).toEqual(expect.any(Object));
    expect(Query["queries"]).toHaveProperty("$match");
    expect(Query["queries"]["$match"]).toHaveProperty("$and");

    expect(Query["queries"]["$match"]?.["$and"]).toHaveLength(1);
    expect(Query["queries"]["$match"]?.["$and"]?.[0]).toEqual(
      expect.any(Object)
    );
    expect(Query["queries"]["$match"]?.["$and"]?.[0]).toHaveProperty(
      "isDeleted"
    );
  });

  test("with isWithTrashed", () => {
    Query["isWithTrashed"] = true;
    Query.where("name", "like", "John");
    Query["generateQuery"]();

    expect(Query["queries"]).toEqual(expect.any(Object));
    expect(Query["queries"]).toHaveProperty("$match");
    expect(Query["queries"]["$match"]).toHaveProperty("$and");
    expect(Query["queries"]["$match"]?.["$and"]).toHaveLength(1);
  });
});

describe("Query - take method", () => {
  test("should return this", () => {
    Query.take(10);
    expect(Query["$limit"]).toEqual(expect.any(Number));
    expect(Query["$limit"]).toBe(10);
  });
});

describe("Query - limit method", () => {
  test("should return this", () => {
    Query.limit(10);
    expect(Query["$limit"]).toEqual(expect.any(Number));
    expect(Query["$limit"]).toBe(10);
  });
});

describe("Query - offset method", () => {
  test("should return this", () => {
    Query.offset(10);
    expect(Query["$skip"]).toEqual(expect.any(Number));
    expect(Query["$skip"]).toBe(10);
  });
});

describe("Query - skip method", () => {
  test("should return this", () => {
    Query.skip(10);
    expect(Query["$skip"]).toEqual(expect.any(Number));
    expect(Query["$skip"]).toBe(10);
  });
});

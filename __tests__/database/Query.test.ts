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
    expect(fields).toHaveLength(2);
    expect(fields[0]).toEqual(expect.any(Object));
    expect(fields[0]).toHaveProperty("$project");
    expect(fields[1]).toEqual(expect.any(Object));
    expect(fields[1]).toHaveProperty("$project");
  });

  test("multiple exclude should return this", () => {
    const result = Query.exclude(["name", "age"]);

    expect(result).toBe(Query);

    const fields = result["fields"];
    expect(fields).toEqual(expect.any(Array));
    expect(fields).toHaveLength(2);
    expect(fields[0]).toEqual(expect.any(Object));
    expect(fields[0]).toHaveProperty("$project");
    expect(fields[1]).toEqual(expect.any(Object));
    expect(fields[1]).toHaveProperty("$project");
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
  });
});

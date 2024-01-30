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

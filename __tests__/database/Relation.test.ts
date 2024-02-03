import Relation from "../../src/database/Relation";

beforeEach(() => {
  Relation["resetRelation"]();
});

describe("Relation - belongsTo method", () => {
  test("should return an object with the collection, foreignKey, localKey and type properties", () => {
    const result = Relation["belongsTo"]("User", "userId");

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("collection", "User");
    expect(result).toHaveProperty("foreignKey", "_id");
    expect(result).toHaveProperty("localKey", "userId");
    expect(result).toHaveProperty("type", "belongsTo");
  });
});

describe("Relation - generateBelongsTo should return this", () => {
  test("should return this", () => {
    const result = Relation["generateBelongsTo"]({
      collection: "users",
      foreignKey: "userId",
      localKey: "_id",
      type: "belongsTo",
      alias: "user",
      options: {},
    });

    expect(result).toEqual(expect.any(Function));

    const lookups = Relation["lookups"];

    expect(lookups).toEqual(expect.any(Array));
    expect(lookups).toHaveLength(2);
    expect(lookups[0]).toEqual(expect.any(Object));
    expect(lookups[0]).toHaveProperty("$lookup");

    expect(lookups[1]).toEqual(expect.any(Object));
    expect(lookups[1]).toHaveProperty("$unwind");
  });
});

describe("Relation - hasMany method", () => {
  test("should return an object with the collection, foreignKey, localKey and type properties", () => {
    const result = Relation["hasMany"]("products", "userId", "_id");

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("collection", "products");
    expect(result).toHaveProperty("foreignKey", "userId");
    expect(result).toHaveProperty("localKey", "_id");
    expect(result).toHaveProperty("type", "hasMany");
  });
});

describe("Relation - generateHasMany should return this", () => {
  test("should return this", () => {
    const result = Relation["generateHasMany"]({
      collection: "products",
      foreignKey: "userId",
      localKey: "_id",
      type: "hasMany",
      alias: "products",
      options: {},
    });

    expect(result).toEqual(expect.any(Function));

    const lookups = Relation["lookups"];

    expect(lookups).toEqual(expect.any(Array));
    expect(lookups).toHaveLength(1);
    expect(lookups[0]).toEqual(expect.any(Object));
    expect(lookups[0]).toHaveProperty("$lookup");
  });
});

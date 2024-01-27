import Relation from "../../src/database/Relation";

test("belongsTo method should be return an object", () => {
  const result = Relation.belongsTo("users", "userId", "_id");

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("collection");
  expect(result.collection).toEqual("users");
  expect(result).toHaveProperty("foreignKey");
  expect(result.foreignKey).toEqual("_id");
  expect(result).toHaveProperty("localKey");
  expect(result.localKey).toEqual("userId");
  expect(result).toHaveProperty("type");
  expect(result.type).toEqual("belongsTo");
});

test("hasMany method should be return an object", () => {
  const result = Relation.hasMany("posts", "userId", "_id");

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("collection");
  expect(result.collection).toEqual("posts");
  expect(result).toHaveProperty("foreignKey");
  expect(result.foreignKey).toEqual("userId");
  expect(result).toHaveProperty("localKey");
  expect(result.localKey).toEqual("_id");
  expect(result).toHaveProperty("type");
  expect(result.type).toEqual("hasMany");
});

test("belongsToMany method should be return an object", () => {
  const result = Relation.belongsToMany(
    "roles",
    "userRoles",
    "userId",
    "roleId"
  );

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("collection");
  expect(result.collection).toEqual("roles");
  expect(result).toHaveProperty("pivotCollection");
  expect(result.pivotCollection).toEqual("userRoles");
  expect(result).toHaveProperty("foreignKey");
  expect(result.foreignKey).toEqual("userId");
  expect(result).toHaveProperty("localKey");
  expect(result.localKey).toEqual("roleId");
  expect(result).toHaveProperty("type");
  expect(result.type).toEqual("belongsToMany");
  expect(result).toHaveProperty("attach");
  expect(result.attach).toEqual(expect.any(Function));
  expect(result).toHaveProperty("detach");
  expect(result.detach).toEqual(expect.any(Function));
  expect(result).toHaveProperty("sync");
  expect(result.sync).toEqual(expect.any(Function));
});

test("hasManyThrogh method should be return an object", () => {
  const result = Relation.hasManyThrough(
    "products",
    "users",
    "countryId",
    "userId"
  );

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("collection");
  expect(result.collection).toEqual("products");
  expect(result).toHaveProperty("throughCollection");
  expect(result.throughCollection).toEqual("users");
  expect(result).toHaveProperty("foreignKey");
  expect(result.foreignKey).toEqual("userId");
  expect(result).toHaveProperty("localKey");
  expect(result.localKey).toEqual("countryId");
  expect(result).toHaveProperty("type");
  expect(result.type).toEqual("hasManyThrough");
});

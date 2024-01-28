import Relation from "../../src/database/Relation";
import Model from "../../src/database/Model";

class Country extends Model {
  protected static collection: string = "countriesTest";

  static products() {
    return this.hasManyThrough(Product, User, "countryId", "userId");
  }
}

class User extends Model {
  protected static collection: string = "usersTest";

  static products() {
    return this.hasMany(Product, "userId", "_id");
  }

  static roles() {
    return this.belongsToMany(Role, "userRoles", "userId", "roleId");
  }
}

class Product extends Model {
  protected static collection: string = "productsTest";

  static user() {
    return this.belongsTo(User, "userId", "_id");
  }
}

class Role extends Model {
  protected static collection: string = "roles";
}

beforeEach(() => {
  User.resetRelation();
  Product.resetRelation();
  Country.resetRelation();
  Role.resetRelation();
});

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

test("with method with belongsTo relation should be return this", () => {
  const result = Product.with("user");

  expect(result).toBe(Product);
  expect(result).toEqual(expect.any(Function));
  expect(result).toHaveProperty("lookups");

  const lookups = result.lookups;
  expect(lookups).toEqual(expect.any(Array));
  expect(lookups).toHaveLength(2);

  const lookup = lookups[0];
  expect(lookup).toEqual(expect.any(Object));
  expect(lookup).toHaveProperty("$lookup");

  const unwind = lookups[1];
  expect(unwind).toEqual(expect.any(Object));
  expect(unwind).toHaveProperty("$unwind");
});

test("with method with hasMany relation should be return this", () => {
  const result = User.with("products");

  expect(result).toBe(User);
  expect(result).toEqual(expect.any(Function));
  expect(result).toHaveProperty("lookups");

  const lookups = result.lookups;
  expect(lookups).toEqual(expect.any(Array));
  expect(lookups).toHaveLength(1);

  const lookup = lookups[0];
  expect(lookup).toEqual(expect.any(Object));
  expect(lookup).toHaveProperty("$lookup");
});

test("with method with belongsToMany relation should be return this", () => {
  const result = User.with("roles");

  expect(result).toBe(User);
  expect(result).toEqual(expect.any(Function));
  expect(result.lookups).toHaveLength(3);

  expect(result.lookups[0]).toEqual(expect.any(Object));
  expect(result.lookups[0]).toHaveProperty("$lookup");

  expect(result.lookups[1]).toEqual(expect.any(Object));
  expect(result.lookups[1]).toHaveProperty("$lookup");

  expect(result.lookups[2]).toEqual(expect.any(Object));
  expect(result.lookups[2]).toHaveProperty("$project");
});

test("with method with hasManyThrough relation should be return this", () => {
  const result = Country.with("products");

  expect(result).toBe(Country);
  expect(result).toEqual(expect.any(Function));
  expect(result.lookups).toHaveLength(3);

  expect(result.lookups[0]).toEqual(expect.any(Object));
  expect(result.lookups[0]).toHaveProperty("$lookup");

  expect(result.lookups[1]).toEqual(expect.any(Object));
  expect(result.lookups[1]).toHaveProperty("$lookup");

  expect(result.lookups[2]).toEqual(expect.any(Object));
  expect(result.lookups[2]).toHaveProperty("$project");
});

test("with method with hasMany relation and select fields should be return this", () => {
  const result = User.with("products", {
    select: ["name", "price"],
  });

  expect(result).toBe(User);
  expect(result).toEqual(expect.any(Function));
  expect(result.lookups).toHaveLength(4);

  expect(result.lookups[0]).toEqual(expect.any(Object));
  expect(result.lookups[0]).toHaveProperty("$lookup");

  expect(result.lookups[1]).toEqual(expect.any(Object));
  expect(result.lookups[1]).toHaveProperty("$project");

  expect(result.lookups[2]).toEqual(expect.any(Object));
  expect(result.lookups[2]).toHaveProperty("$set");

  expect(result.lookups[3]).toEqual(expect.any(Object));
  expect(result.lookups[3]).toHaveProperty("$replaceRoot");
});

test("with method with hasMany relation and exclude fields should be return this", () => {
  const result = User.with("products", {
    exclude: ["name", "price"],
  });

  expect(result).toBe(User);
  expect(result).toEqual(expect.any(Function));
  expect(result.lookups).toHaveLength(2);

  expect(result.lookups[0]).toEqual(expect.any(Object));
  expect(result.lookups[0]).toHaveProperty("$lookup");

  expect(result.lookups[1]).toEqual(expect.any(Object));
  expect(result.lookups[1]).toHaveProperty("$project");
});

test("with method with hasMany relation and select and exclude fields should be return this", () => {
  const result = User.with("products", {
    select: ["name", "price"],
    exclude: ["name"],
  });

  expect(result).toBe(User);
  expect(result).toEqual(expect.any(Function));
  expect(result.lookups).toHaveLength(5);

  expect(result.lookups[0]).toEqual(expect.any(Object));
  expect(result.lookups[0]).toHaveProperty("$lookup");

  expect(result.lookups[1]).toEqual(expect.any(Object));
  expect(result.lookups[1]).toHaveProperty("$project");

  expect(result.lookups[2]).toEqual(expect.any(Object));
  expect(result.lookups[2]).toHaveProperty("$set");

  expect(result.lookups[3]).toEqual(expect.any(Object));
  expect(result.lookups[3]).toHaveProperty("$replaceRoot");

  expect(result.lookups[4]).toEqual(expect.any(Object));
  expect(result.lookups[4]).toHaveProperty("$project");
});

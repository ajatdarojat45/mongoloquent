import Relation from "../../src/database/Relation";
import Model from "../../src/database/Model";

class Country extends Model {
  protected collection = "countries";

  static products() {
    return this.hasManyThrough(Product, User, "countryId", "userId");
  }
}

class User extends Model {
  protected collection = "users";

  static products() {
    return this.hasMany(Product, "userId", "_id");
  }

  static roles() {
    return this.belongsToMany(Role, "userRoles", "userId", "roleId");
  }
}

class Product extends Model {
  protected collection = "products";

  static user() {
    return this.belongsTo(User, "userId", "_id");
  }
}

class Role extends Model {
  protected collection = "roles";
}

beforeEach(() => {
  Relation["resetRelation"]();
});

describe("Relation - with method", () => {
  test("hasMany should return this", () => {
    const result = User["with"]("products");

    expect(result).toBe(User);
    expect(result).toEqual(expect.any(Function));
  });

  test("belongsTo should return this", () => {
    const result = Product["with"]("user");

    expect(result).toBe(Product);
    expect(result).toEqual(expect.any(Function));
  });

  test("hasManyThrough should return this", () => {
    const result = Country["with"]("products");

    expect(result).toBe(Country);
    expect(result).toEqual(expect.any(Function));
  });

  test("belongsToMany should return this", () => {
    const result = User["with"]("roles");

    expect(result).toBe(User);
    expect(result).toEqual(expect.any(Function));
  });

  test("invoke non exist relation should return this", () => {
    const result = User["with"]("nonExist");

    expect(result).toBe(User);
    expect(result).toEqual(expect.any(Function));
  });
});

describe("Relation - has method", () => {
  test("hasMany should return this", () => {
    const result = User["has"]("products");

    expect(result).toBe(User);
    expect(result).toEqual(expect.any(Function));
  });
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

  test("with select fields options should return this", () => {
    Relation["fields"] = [{}];

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

describe("Relation - belongsToMany method", () => {
  test("should return an object with the collection, foreignKey, localKey and type properties", () => {
    const result = Relation["belongsToMany"](
      "products",
      "users",
      "userId",
      "_id"
    );

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("collection", "products");
    expect(result).toHaveProperty("foreignKey", "userId");
    expect(result).toHaveProperty("localKey", "_id");
    expect(result).toHaveProperty("type", "belongsToMany");
  });
});

describe("Relation - generateBelongsToMany should return this", () => {
  test("should return this", () => {
    const result = Relation["generateBelongsToMany"]({
      collection: "products",
      pivotCollection: "users",
      foreignKey: "countryId",
      localKey: "userId",
      type: "belongsToMany",
      alias: "products",
      options: {},
    });

    expect(result).toEqual(expect.any(Function));

    const lookups = Relation["lookups"];
    expect(lookups).toEqual(expect.any(Array));
    expect(lookups).toHaveLength(3);

    expect(lookups[0]).toEqual(expect.any(Object));
    expect(lookups[0]).toHaveProperty("$lookup");

    expect(lookups[1]).toEqual(expect.any(Object));
    expect(lookups[1]).toHaveProperty("$lookup");

    expect(lookups[2]).toEqual(expect.any(Object));
    expect(lookups[2]).toHaveProperty("$project");
  });
});

describe("Relation - hasManyThrough method", () => {
  test("should return an object with the collection, foreignKey, localKey and type properties", () => {
    const result = Relation["hasManyThrough"](
      "roles",
      "userRoles",
      "userId",
      "_id"
    );

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("collection", "roles");
    expect(result).toHaveProperty("throughCollection", "userRoles");
    expect(result).toHaveProperty("foreignKey", "_id");
    expect(result).toHaveProperty("localKey", "userId");
    expect(result).toHaveProperty("type", "hasManyThrough");
  });
});

describe("Relation - generateHasManyThrough should return this", () => {
  test("should return this", () => {
    const result = Relation["generateHasManyThrough"]({
      collection: "roles",
      throughCollection: "userRoles",
      foreignKey: "roleId",
      localKey: "userId",
      type: "hasManyThrough",
      alias: "roles",
      options: {},
    });

    expect(result).toEqual(expect.any(Function));

    const lookups = Relation["lookups"];
    expect(lookups).toEqual(expect.any(Array));
    expect(lookups).toHaveLength(3);

    expect(lookups[0]).toEqual(expect.any(Object));
    expect(lookups[0]).toHaveProperty("$lookup");

    expect(lookups[1]).toEqual(expect.any(Object));
    expect(lookups[1]).toHaveProperty("$lookup");

    expect(lookups[2]).toEqual(expect.any(Object));
    expect(lookups[2]).toHaveProperty("$project");
  });
});

describe("Relation - selectFields method", () => {
  test("select fields in options should return this", () => {
    const result = Relation["selectFields"]({
      collection: "products",
      foreignKey: "userId",
      localKey: "_id",
      type: "hasMany",
      alias: "products",
      options: {
        select: ["name", "price"],
      },
    });

    expect(result).toEqual(expect.any(Function));

    const lookups = Relation["lookups"];
    expect(lookups).toEqual(expect.any(Array));
    expect(lookups).toHaveLength(3);

    expect(lookups[0]).toEqual(expect.any(Object));
    expect(lookups[0]).toHaveProperty("$project");

    expect(lookups[1]).toEqual(expect.any(Object));
    expect(lookups[1]).toHaveProperty("$set");

    expect(lookups[2]).toEqual(expect.any(Object));
    expect(lookups[2]).toHaveProperty("$replaceRoot");
  });

  test("exclude fields in options should return this", () => {
    const result = Relation["selectFields"]({
      collection: "products",
      foreignKey: "userId",
      localKey: "_id",
      type: "hasMany",
      alias: "products",
      options: {
        exclude: ["name", "price"],
      },
    });

    expect(result).toEqual(expect.any(Function));

    const lookups = Relation["lookups"];
    expect(lookups).toEqual(expect.any(Array));
    expect(lookups).toHaveLength(1);

    expect(lookups[0]).toEqual(expect.any(Object));
    expect(lookups[0]).toHaveProperty("$project");
  });
});

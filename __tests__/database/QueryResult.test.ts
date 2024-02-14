import Model from "../../src/database/Model";

class User extends Model {
  protected collection = "users";
}

const userCollection = User["getCollection"]();

beforeAll(async () => {
  await userCollection.deleteMany({});

  await userCollection.insertMany([
    {
      name: "John",
      email: "john@mail.com",
      age: 10,
      balance: 100,
      isDeleted: false,
    },
    {
      name: "doe",
      email: "doe@mail.com",
      age: 30,
      balance: 200,
      isDeleted: false,
    },
    {
      name: "Udin",
      email: "udin@mail.com",
      age: 5,
      balance: 500,
      isDeleted: false,
    },
    {
      name: "Kosasih",
      email: "kosasih@mail.com",
      age: 5,
      balance: 400,
      isDeleted: false,
    },
    {
      name: "Joko",
      email: "joko@mail.com",
      age: 45,
      balance: 500,
      isDeleted: true,
    },
  ]);
});

afterAll(async () => {
  await userCollection.deleteMany({});
});

describe("QueryResult - orderBy method", () => {
  it("orderBy without define order", async () => {
    const result: any[] = await User.orderBy("age").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
  });

  it("orderBy with asc order", async () => {
    const result: any[] = await User.orderBy("age", "asc").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
  });

  it("orderBy with desc order", async () => {
    const result: any[] = await User.orderBy("age", "desc").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(45);
  });

  it("orderBy with string field", async () => {
    const result: any[] = await User.orderBy("name").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).not.toBe("Doe");
  });

  it("orderBy with insensitive", async () => {
    const result: any[] = await User.orderBy("name", "asc", true).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("doe");
  });

  it("orderBy with insensitive and desc order", async () => {
    const result: any[] = await User.orderBy("name", "desc", true).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("Udin");
  });

  it("orderBy with multiple orderBy", async () => {
    const result: any[] = await User.orderBy("age", "asc")
      .orderBy("balance", "desc")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
    expect(result[0].age).toBe(5);
    expect(result[0].balance).toBe(500);
  });
});

describe("QueryResult - groupBy method", () => {
  it("with single groupBy", async () => {
    const result: any[] = await User.groupBy("age").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("with multiple groupBy", async () => {
    const result: any[] = await User.groupBy("age").groupBy("name").get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);
  });
});

describe("QueryResult - select method", () => {
  it("single select with string", async () => {
    const result: any = await User.select("name").first();

    expect(result).toEqual(expect.any(Object));
    expect(result.name).toBeDefined();
    expect(result.email).toBeUndefined();
    expect(result.age).toBeUndefined();
    expect(result.balance).toBeUndefined();
    expect(result.isDeleted).toBeUndefined();
  });

  it("single select with array", async () => {
    const result: any = await User.select(["name", "age"]).first();

    expect(result).toEqual(expect.any(Object));
    expect(result.name).toBeDefined();
    expect(result.email).toBeUndefined();
    expect(result.age).toBeDefined();
    expect(result.balance).toBeUndefined();
    expect(result.isDeleted).toBeUndefined();
  });

  it("multiple select", async () => {
    const result: any = await User.select("name")
      .select(["age", "email"])
      .first();

    expect(result).toEqual(expect.any(Object));
    expect(result.name).toBeDefined();
    expect(result.email).toBeDefined();
    expect(result.age).toBeDefined();
    expect(result.balance).toBeUndefined();
    expect(result.isDeleted).toBeUndefined();
  });
});

describe("QueryResult - exclude method", () => {
  it("single exclude with string", async () => {
    const result: any = await User.exclude("name").first();

    expect(result).toEqual(expect.any(Object));
    expect(result.name).toBeUndefined();
    expect(result.email).toBeDefined();
    expect(result.age).toBeDefined();
    expect(result.balance).toBeDefined();
    expect(result.isDeleted).toBeDefined();
  });

  it("single exclude with array", async () => {
    const result: any = await User.exclude(["name", "age"]).first();

    expect(result).toEqual(expect.any(Object));
    expect(result.name).toBeUndefined();
    expect(result.email).toBeDefined();
    expect(result.age).toBeUndefined();
    expect(result.balance).toBeDefined();
    expect(result.isDeleted).toBeDefined();
  });

  it("multiple exclude", async () => {
    const result: any = await User.exclude("name")
      .exclude(["age", "email"])
      .first();

    expect(result).toEqual(expect.any(Object));
    expect(result.name).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.age).toBeUndefined();
    expect(result.balance).toBeDefined();
    expect(result.isDeleted).toBeDefined();
  });
});

describe("QueryResult - where method", () => {
  it("where with single condition and without operator", async () => {
    const result: any[] = await User.where("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("where with single condition and equal operator", async () => {
    const result: any[] = await User.where("balance", "=", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("where with soft delete", async () => {
    User["softDelete"] = true;

    const result: any[] = await User.where("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("where with multiple condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });
});

describe("QueryResult - orWhere method", () => {
  it("orWhere with single condition and without operator", async () => {
    const result: any[] = await User.orWhere("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("orWhere with single condition and with operator", async () => {
    const result: any[] = await User.orWhere("balance", ">=", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("orWhere with multiple condition", async () => {
    const result: any[] = await User.orWhere("balance", 500)
      .orWhere("age", 5)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhere with with where", async () => {
    const result: any[] = await User.where("name", "doe")
      .orWhere("balance", 500)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhere with soft delete", async () => {
    User["softDelete"] = true;

    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });
});

describe("QueryResult - whereIn method", () => {
  it("whereIn with single condition", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("whereIn with multiple condition", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhereIn("name", ["Kosasih"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("whereIn with soft delete", async () => {
    User["softDelete"] = true;

    const result: any[] = await User.whereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });
});

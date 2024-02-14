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
  it("single condition with operator", async () => {
    const result: any[] = await User.where("balance", ">=", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("single condition without operator", async () => {
    const result: any[] = await User.where("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("with and condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("with or condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .orWhere("age", 5)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("with and & or condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("with soft delete", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("with soft delete & withTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500).withTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("with soft delete, withTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 45)
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("with soft delete & onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.onlyTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 100)
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["softDelete"] = false;
  });
});

describe("QueryResult - orWhere method", () => {
  it("single condition with operator", async () => {
    const result: any[] = await User.orWhere("balance", ">=", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("single condition without operator", async () => {
    const result: any[] = await User.orWhere("balance", 500).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("with and condition", async () => {
    const result: any[] = await User.orWhere("balance", 500)
      .orWhere("age", "<=", 10)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("with or condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("with and & or condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("with soft delete", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("name", "Kosasih")
      .orWhere("balance", 500)
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 45)
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("with soft delete & withTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500).withTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("with soft delete, withTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 5)
      .orWhere("name", "Joko")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("with soft delete & onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.onlyTrashed().get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("balance", 500)
      .where("age", 100)
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["softDelete"] = false;
  });
});

describe("QueryResult - whereIn method", () => {
  it("whereIn with single condition", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("whereIn with whereIn", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .whereIn("name", ["Udin"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("whereIn with where", async () => {
    const result: any[] = await User.where("name", "doe")
      .whereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("whereIn with orWhereIn", async () => {
    const result: any[] = await User.where("name", "doe")
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("whereIn with orWhere", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("whereIn with orWhereIn", async () => {
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

  it("whereIn with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("balance", [500, 200])
      .where("name", "Udin")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereIn with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("whereIn with soft delete, withTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("whereIn with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("balance", [500, 200])
      .where("age", 5)
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereIn with soft delete & onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereIn with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereIn with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("balance", [500, 200])
      .where("age", 100)
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["softDelete"] = false;
  });
});

describe("QueryResult - orWhereIn method", () => {
  it("orWhereIn with single condition", async () => {
    const result: any[] = await User.orWhereIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereIn with multiple condition", async () => {
    const result: any[] = await User.orWhereIn("balance", [500, 200])
      .orWhereIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereIn and where condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .orWhereIn("age", [45, 10])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereIn with whereIn", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhereIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereIn with soft delete", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("orWhereIn with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("orWhereIn with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("name", "Kosasih")
      .orWhere("age", 10)
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("orWhereIn with soft delete & withTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("orWhereIn with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("orWhereIn with soft delete & onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereIn("age", [10])
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("orWhereIn with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 10)
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("orWhereIn with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("name", "Kosasih")
      .orWhere("age", 10)
      .orWhereIn("balance", [500, 200])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });
});

describe("QueryResult - whereNotIn method", () => {
  it("whereNotIn with single condition", async () => {
    const result: any[] = await User.whereNotIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("whereNotIn with multiple condition", async () => {
    const result: any[] = await User.whereNotIn("balance", [500, 200])
      .whereNotIn("age", [5])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("whereNotIn with where condition", async () => {
    const result: any[] = await User.where("balance", 500)
      .whereNotIn("age", [45, 10])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("whereNotIn with orWhereIn", async () => {
    const result: any[] = await User.whereNotIn("age", [5, 10])
      .orWhereIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("whereNotIn with orWhereNotIn", async () => {
    const result: any[] = await User.whereNotIn("age", [5, 10])
      .orWhereNotIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("whereNotIn with whereIn", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .whereNotIn("age", [5, 10, 30])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);
  });

  it("whereNotIn with soft delete", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn(
      "balance",
      [100, 200, 400]
    ).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .where("name", "!=", "Udin")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete & withTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .where("name", "Udin")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete, withTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete, onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .where("name", "Udin")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["softDelete"] = false;
  });

  it("whereNotIn with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });
});

describe("QueryResult - orWhereNotIn method", () => {
  it("orWhereNotIn with single condition", async () => {
    const result: any[] = await User.orWhereNotIn("balance", [500, 200]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("orWhereNotIn with and condition", async () => {
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [500, 200])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereNotIn with or condition", async () => {
    const result: any[] = await User.orWhereNotIn("balance", [500, 200])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereNotIn with and & or condition", async () => {
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [500, 200])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereNotIn with whereIn", async () => {
    const result: any[] = await User.whereIn("balance", [500, 200])
      .orWhereNotIn("age", [5, 10, 30])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereNotIn with whereNotIn", async () => {
    const result: any[] = await User.whereNotIn("balance", [500, 200])
      .orWhereNotIn("name", ["doe"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereNotIn with soft delete", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhereNotIn("name", ["John"])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete & withTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.orWhereNotIn("balance", [100, 200, 400])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.orWhereNotIn(
      "balance",
      [100, 200, 400, 500]
    )
      .where("name", "Joko")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete, withTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.orWhereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete, onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.orWhereNotIn("balance", [100, 200, 400])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereNotIn("balance", [100, 200, 400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["softDelete"] = false;
  });

  it("orWhereNotIn with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereNotIn("balance", [100, 200, 400])
      .orWhere("name", "Kosasih")
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });
});

describe("QueryResult - whereBetween method", () => {
  it("whereBetween with single condition", async () => {
    const result: any[] = await User.whereBetween("balance", [400, 500]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("whereBetween with and condition", async () => {
    const result: any[] = await User.whereBetween("age", [5, 10])
      .whereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("whereBetween with or condition", async () => {
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("whereBetween with and & or condition", async () => {
    const result: any[] = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("whereBetween with soft delete", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("balance", [400, 500]).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .whereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete & withTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .whereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete, withTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(5);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete, onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 50])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .whereBetween("balance", [400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(0);

    User["softDelete"] = false;
  });

  it("whereBetween with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });
});

describe("QueryResult - whereNotBetween method", () => {
  it("orWhereBetween with single condition", async () => {
    const result: any[] = await User.orWhereBetween(
      "balance",
      [400, 500]
    ).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);
  });

  it("orWhereBetween with and condition", async () => {
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with or condition", async () => {
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with and & or condition", async () => {
    const result: any[] = await User.orWhere("age", 5)
      .orWhereBetween("balance", [400, 500])
      .orWhere("name", "doe")
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with whereBetween", async () => {
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);
  });

  it("orWhereBetween with soft delete", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.orWhereBetween(
      "balance",
      [400, 500]
    ).get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete & withTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.orWhereBetween("age", [5, 10])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete, withTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(3);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete, withTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [400, 500])
      .withTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(4);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete, onlyTrashed", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 50])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete, onlyTrashed & and condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.where("age", 5)
      .orWhereBetween("balance", [400, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });

  it("orWhereBetween with soft delete, onlyTrashed & or condition", async () => {
    User["softDelete"] = true;
    const result: any[] = await User.whereBetween("age", [5, 10])
      .orWhereBetween("balance", [200, 500])
      .onlyTrashed()
      .get();

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(1);

    User["softDelete"] = false;
  });
});

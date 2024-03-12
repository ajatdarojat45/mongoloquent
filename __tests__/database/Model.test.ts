import Model from "../../src/database/Model";

const users = [
  {
    name: "John Doe",
    email: "jhon@mail.com",
    age: 20,
    isDeleted: false,
  },
  {
    name: "Udin",
    email: "udin@mail.com",
    isDeleted: false,
    age: 10,
  },
  {
    name: "Kosasih",
    email: "kosasih@mail.com",
    isDeleted: true,
    age: 50,
  },
];

class User extends Model {
  static collection = "users";
}

beforeAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

afterAll(async () => {
  try {
    const userCollection = User["getCollection"]();
    await userCollection.deleteMany({});
  } catch (error) {
    console.error(error);
  }
});

describe("Model - all method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return all users", async () => {
    User["softDelete"] = false;
    const result = await User.all();
    expect(result.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
  });

  it("should return all users with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.all();
    expect(result.length).toBe(2);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
  });
});

describe("Model - get method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return all users", async () => {
    User["softDelete"] = false;
    const result = await User.get();

    expect(result.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
  });

  it("should return all users with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.get();

    expect(result.length).toBe(2);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
  });

  it("should return all users with selected field", async () => {
    User["softDelete"] = false;
    const result = await User.get("name");

    expect(result.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).not.toHaveProperty("age");
    expect(result[0]).not.toHaveProperty("email");
  });

  it("should return all users with selected fields", async () => {
    User["softDelete"] = false;
    const result = await User.get(["name", "age"]);

    expect(result.length).toBe(3);
    expect(result).toEqual(expect.any(Array));
    expect(result[0]).toEqual(expect.any(Object));
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("age");
    expect(result[0]).not.toHaveProperty("email");
  });
});

describe("Model - first method", () => {
  beforeAll(async () => {
    try {
      const userCollection = User["getCollection"]();
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      const userCollection = User["getCollection"]();
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return first user", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Kosasih").first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Kosasih");
  });

  it("should return first user with selected field", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Kosasih").first("name");

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Kosasih");
    expect(result).not.toHaveProperty("age");
    expect(result).not.toHaveProperty("email");
  });

  it("should return first user with selected fields", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Kosasih").first(["name", "age"]);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Kosasih");
    expect(result).toHaveProperty("age", 50);
    expect(result).not.toHaveProperty("email");
  });

  it("should return first user with non exist data", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Kosasih1").first();

    expect(result).toEqual(null);
  });

  it("should return first user with soft delete data", async () => {
    User["softDelete"] = true;
    const result = await User.where("name", "Kosasih").first();

    expect(result).toEqual(null);
  });
});

describe("Model - find method", () => {
  const userCollection = User["getCollection"]();
  let userIds: any;

  beforeAll(async () => {
    try {
      const { insertedIds } = await userCollection.insertMany(users);
      userIds = insertedIds;
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return user with ObjectId", async () => {
    User["softDelete"] = false;
    const result = await User.find(userIds[2]);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id", userIds[2]);
  });

  it("should return user with string ObjectId", async () => {
    User["softDelete"] = false;
    const result = await User.find(userIds[2].toString());

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id", userIds[2]);
  });

  it("should return user soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.find(userIds[2]);

    expect(result).toEqual(null);
  });
});

describe("Model - paginate method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return paginated users", async () => {
    User["softDelete"] = false;
    const result = await User.paginate(1, 3);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("data", expect.any(Array));
    expect(result.data.length).toBe(3);
    expect(result.data[0]).toEqual(expect.any(Object));

    expect(result).toHaveProperty("meta", expect.any(Object));
    expect(result.meta).toHaveProperty("page", 1);
    expect(result.meta).toHaveProperty("perPage", 3);
    expect(result.meta).toHaveProperty("total", 3);
    expect(result.meta).toHaveProperty("lastPage", 1);
  });

  it("should return paginated users with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.paginate(1, 3);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("data", expect.any(Array));
    expect(result.data.length).toBe(2);
    expect(result.data[0]).toEqual(expect.any(Object));

    expect(result).toHaveProperty("meta", expect.any(Object));
    expect(result.meta).toHaveProperty("page", 1);
    expect(result.meta).toHaveProperty("perPage", 3);
    expect(result.meta).toHaveProperty("total", 2);
    expect(result.meta).toHaveProperty("lastPage", 1);
  });

  it("check lastPage should return paginated users", async () => {
    User["softDelete"] = false;
    const result = await User.paginate(2, 2);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("data", expect.any(Array));
    expect(result.data.length).toBe(1);
    expect(result.data[0]).toEqual(expect.any(Object));

    expect(result).toHaveProperty("meta", expect.any(Object));
    expect(result.meta).toHaveProperty("page", 2);
    expect(result.meta).toHaveProperty("perPage", 2);
    expect(result.meta).toHaveProperty("total", 3);
    expect(result.meta).toHaveProperty("lastPage", 2);
  });
});

describe("Model - max method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return max value", async () => {
    User["softDelete"] = false;
    const result = await User.max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(50);
  });

  it("should return max value with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(20);
  });

  it("with where condition should return max value", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin").max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("with non exist data should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin1").max("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("with non number field should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.max("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});

describe("Model - min method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      const _users = JSON.parse(JSON.stringify(users));
      _users[1].isDeleted = true;

      await userCollection.insertMany(_users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return min value", async () => {
    User["softDelete"] = false;
    const result = await User.min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("should return min value with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(20);
  });

  it("with where condition should return min value", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Kosasih").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(50);
  });

  it("with non exist data should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin1").min("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("with non number field should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.min("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});

describe("Model - avg method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return avg value", async () => {
    User["softDelete"] = false;
    const result = await User.avg("age");

    expect(result).toEqual(expect.any(Number));
    expect(Math.round(result)).toBe(27);
  });

  it("should return avg value with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.avg("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(15);
  });

  it("with where condition should return avg value", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin").avg("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("with non exist data should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin1").avg("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("with non number field should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.avg("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});

describe("Model - sum method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return sum value", async () => {
    User["softDelete"] = false;
    const result = await User.sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(80);
  });

  it("should return sum value with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(30);
  });

  it("with where condition should return sum value", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin").sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(10);
  });

  it("with non exist data should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin1").sum("age");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });

  it("with non number field should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.sum("name");

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});

describe("Model - count method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return count value", async () => {
    User["softDelete"] = false;
    const result = await User.count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(3);
  });

  it("should return count value with soft delete", async () => {
    User["softDelete"] = true;
    const result = await User.count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(2);
  });

  it("with where condition should return count value", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin").count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toBe(1);
  });

  it("with non exist data should return 0", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin1").count();

    expect(result).toEqual(expect.any(Number));
    expect(result).toEqual(0);
  });
});

describe("Model - pluck method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
      await userCollection.insertMany(users);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should return pluck value", async () => {
    User["softDelete"] = false;
    const result = await User.pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["John Doe", "Udin", "Kosasih"]);
  });

  it("with where condition should return pluck value", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin").pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["Udin"]);
  });

  it("with non exist data should return empty array", async () => {
    User["softDelete"] = false;
    const result = await User.where("name", "Udin1").pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual([]);
  });

  it("with non exist field should return empty array", async () => {
    User["softDelete"] = false;
    const result = await User.pluck("address");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual([]);
  });

  it("with $skip should return pluck value", async () => {
    User["softDelete"] = false;
    const result = await User.skip(1).pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["Udin", "Kosasih"]);
  });

  it("with $limit should return pluck value", async () => {
    User["softDelete"] = false;
    const result = await User.limit(2).pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["John Doe", "Udin"]);
  });

  it("with $skip and $limit should return pluck value", async () => {
    User["softDelete"] = false;
    const result = await User.skip(1).limit(1).pluck("name");

    expect(result).toEqual(expect.any(Array));
    expect(result).toEqual(["Udin"]);
  });
});

describe("Model - insert method", () => {
  const userCollection = User["getCollection"]();

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should insert data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const result = await User.insert({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
  });

  it("should insert data with timestamps", async () => {
    User["softDelete"] = false;
    User["timestamps"] = true;

    const result = await User.insert({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should insert with soft delete", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    const result = await User.insert({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("isDeleted", false);
  });

  it("should insert with soft delete and timestamps", async () => {
    User["softDelete"] = true;
    User["timestamps"] = true;

    const result = await User.insert({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("isDeleted", false);
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });
});

describe("Model - create method", () => {
  const userCollection = User["getCollection"]();

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should insert data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
  });

  it("should insert data with timestamps", async () => {
    User["softDelete"] = false;
    User["timestamps"] = true;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should insert with soft delete", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("isDeleted", false);
  });

  it("should insert with soft delete and timestamps", async () => {
    User["softDelete"] = true;
    User["timestamps"] = true;

    const result = await User.create({
      name: "Udin",
      age: 20,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("isDeleted", false);
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });
});

describe("Model - insertMany method", () => {
  const userCollection = User["getCollection"]();

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should insert data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should insert data with timestamps", async () => {
    User["softDelete"] = false;
    User["timestamps"] = true;

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should insert with soft delete", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });

  it("should insert with soft delete and timestamps", async () => {
    User["softDelete"] = true;
    User["timestamps"] = true;

    const result = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Jakarta",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    expect(result).toEqual(expect.any(Array));
    expect(result).toHaveLength(2);
  });
});

describe("Model - update method", () => {
  const userCollection = User["getCollection"]();

  beforeAll(async () => {
    try {
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should update data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id");
  });

  it("should update data with timestamps", async () => {
    User["softDelete"] = false;
    User["timestamps"] = true;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("createdAt", (user as any).createdAt);
    expect(result).toHaveProperty("updatedAt");
    expect((result as any).updatedAt).not.toEqual((user as any).updatedAt);
  });

  it("with send _id in payload", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      _id: (user as any)._id,
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id", (user as any)._id);
  });

  it("with send createdAt at in payload", async () => {
    User["softDelete"] = false;
    User["timestamps"] = true;

    const user = await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").update({
      createdAt: (user as any).createdAt,
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("name", "Udin Ganteng");
    expect(result).toHaveProperty("age", 21);
    expect(result).toHaveProperty("address", "Jakarta");
    expect(result).toHaveProperty("_id", (user as any)._id);
    expect(result).toHaveProperty("createdAt", (user as any).createdAt);
  });

  it("with not found data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const result = await User.where("name", "Udin").update({
      name: "Udin Ganteng",
      age: 21,
      address: "Jakarta",
    });

    expect(result).toEqual(null);
  });
});

describe("Model - updateMany method", () => {
  const userCollection = User["getCollection"]();

  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should update data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).updateMany({
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
  });

  it("with soft delete", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        isDeleted: false,
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
        isDeleted: false,
      },
      {
        name: "Kosasih",
        age: 27,
        address: "Jakarta",
        isDeleted: true,
      },
    ]);

    const result = await User.where("age", "<", 30).updateMany({
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
  });

  it("with send _id in payload", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 35,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).updateMany({
      _id: "5f0b0e7b8b0d3d0f3c3e3c3e",
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 1);
  });

  it("with send createdAt in payload", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "Kosasih",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).updateMany({
      createdAt: new Date(),
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
  });

  it("with not found data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const result = await User.where("age", ">", 30).updateMany({
      age: 50,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 0);
  });
});

describe("Model - delete method", () => {
  const userCollection = User["getCollection"]();

  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should delete data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").delete();
    const user = await User.where("name", "Udin").first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Bogor");
    expect(user).toEqual(null);
  });

  it("with soft delete", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    await User.insert({
      name: "Udin",
      age: 20,
      address: "Bogor",
    });

    const result = await User.where("name", "Udin").delete();
    const user = await User.where("name", "Udin").withTrashed().first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("name", "Udin");
    expect(result).toHaveProperty("age", 20);
    expect(result).toHaveProperty("address", "Bogor");
    expect(result).toHaveProperty("isDeleted", true);
    expect(user).not.toEqual(null);
  });

  it("with not found data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const result = await User.where("name", "Udin").delete();

    expect(result).toEqual(null);
  });
});

describe("Model - deleteMany method", () => {
  const userCollection = User["getCollection"]();

  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should delete data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).deleteMany();
    const users = await User.all();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users).toEqual([]);
  });

  it("with soft delete", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.where("age", "<", 30).deleteMany();
    const users = await User.where("age", "<", 30).withTrashed().get();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users).toHaveLength(2);
  });

  it("with not found data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const result = await User.where("age", ">", 30).deleteMany();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 0);
  });
});

describe("Model - destroy method", () => {
  const userCollection = User["getCollection"]();

  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("with string param should delete data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.destroy(userIds[0].toString());
    const users = await User.all();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 1);
    expect(users.length).toEqual(1);
  });

  it("with array of string param should delete data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const ids = userIds.map((el) => el.toString());

    const result = await User.destroy(ids);
    const users = await User.all();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users.length).toEqual(0);
  });

  it("with ObjectId param should delete data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.destroy(userIds[0]);
    const users = await User.all();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 1);
    expect(users.length).toEqual(1);
  });

  it("with array of ObjectId param should delete data", async () => {
    User["softDelete"] = false;
    User["timestamps"] = false;

    const userIds = await User.insertMany([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
      },
      {
        name: "John Doe",
        age: 25,
        address: "Bandung",
      },
    ]);

    const result = await User.destroy(userIds);
    const users = await User.all();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users.length).toEqual(0);
  });
});

describe("Model - forceDelete method", () => {
  const userCollection = User["getCollection"]();

  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should force delete data", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },

      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },
    ]);

    const result = await User.forceDelete();
    const users = await User.withTrashed().get();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 2);
    expect(users).toEqual([]);
  });

  it("with queries should force delete data", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },

      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },
    ]);

    const result = await User.where("name", "Udin").forceDelete();
    const user = await User.where("name", "Udin").withTrashed().first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 1);
    expect(user).toEqual(null);
  });

  it("with not found data", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    const result = await User.where("name", "Udin").forceDelete();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount", 0);
  });
});

describe("Model - restore method", () => {
  const userCollection = User["getCollection"]();

  beforeEach(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    try {
      await userCollection.deleteMany({});
    } catch (error) {
      console.error(error);
    }
  });

  it("should restore data", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },

      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },
    ]);

    const result = await User.restore();
    const users = await User.get();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 2);
    expect(users).toHaveLength(2);
  });

  it("with queries should restore data", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    await userCollection["insertMany"]([
      {
        name: "Udin",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },

      {
        name: "Kosasih",
        age: 20,
        address: "Bogor",
        isDeleted: true,
      },
    ]);

    const result = await User.where("name", "Udin").restore();
    const user = await User.where("name", "Udin").first();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 1);
    expect(user).toEqual(expect.any(Object));
  });

  it("with not found data", async () => {
    User["softDelete"] = true;
    User["timestamps"] = false;

    const result = await User.where("name", "Udin").restore();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount", 0);
  });
});

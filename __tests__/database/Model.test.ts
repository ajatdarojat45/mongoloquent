import { ObjectId } from "mongodb";
import Model from "../../src/database/Model";

beforeEach(async () => {
  jest.restoreAllMocks();

  const collection = Model["getCollection"]();

  await collection.deleteMany({});
});

describe("Model - all method", () => {
  test("should return an array", async () => {
    const result = await Model.all();

    expect(result).toEqual(expect.any(Array));
  });
});

describe("Model - get method", () => {
  test("should return an array", async () => {
    const result = await Model["get"]();

    expect(result).toEqual(expect.any(Array));
  });

  test("with selected fields should return an array", async () => {
    const result = await Model["get"](["name", "email"]);

    expect(result).toEqual(expect.any(Array));
  });
});

describe("Model - first method", () => {
  test("should return an object", async () => {
    const result = await Model["first"]();

    expect(result).toEqual(expect.any(Object));
  });

  test("with selected fields should return an object", async () => {
    const result = await Model["first"](["name", "email"]);

    expect(result).toEqual(expect.any(Object));
  });
});

describe("Model - find method", () => {
  test("with string param should return an object", async () => {
    const result = await Model["find"]("5f0f5d8f5c5e7d4e0b0e3f0b");

    expect(result).toEqual(expect.any(Object));
  });

  test("with ObjectId param should return an array", async () => {
    const result = await Model["find"](
      new ObjectId("5f0f5d8f5c5e7d4e0b0e3f0b")
    );

    expect(result).toEqual(expect.any(Object));
  });
});

describe("Model - paginate method", () => {
  test("should return an object", async () => {
    const result = await Model["paginate"](1, 10);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("meta");
    expect(result.meta).toEqual(expect.any(Object));
    expect(result.meta).toHaveProperty("total");
    expect(result.meta).toHaveProperty("page");
    expect(result.meta).toHaveProperty("perPage");
    expect(result.meta).toHaveProperty("lastPage");
  });
});

describe("Model - aggregate method", () => {
  test("should return an aggregate cursor", () => {
    const result = Model["aggregate"]();
    expect(result).toEqual(expect.any(Object));
  });

  test("with sort should return an aggregate cursor", () => {
    const result = Model["orderBy"]("age", "asc")["aggregate"]();

    expect(result).toEqual(expect.any(Object));
  });

  test("with selected fields should return an aggregate cursor", () => {
    const result = Model["select"](["name", "email"])["aggregate"]();

    expect(result).toEqual(expect.any(Object));
  });

  test("with groupBy should return an aggregate cursor", () => {
    const result = Model["groupBy"]("age")["aggregate"]();

    expect(result).toEqual(expect.any(Object));
  });

  test("with $skip should return an aggregate cursor", () => {
    const result = Model.skip(1)["aggregate"]();

    expect(result).toEqual(expect.any(Object));
  });

  test("with $limit should return an aggregate cursor", () => {
    const result = Model.limit(1)["aggregate"]();

    expect(result).toEqual(expect.any(Object));
  });
});

describe("Model - max method", () => {
  test("should return a number", async () => {
    const result = await Model["max"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip should return a number", async () => {
    Model["$skip"] = 1;
    const result = await Model["max"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $limit should return a number", async () => {
    Model["$limit"] = 1;
    const result = await Model["max"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip and $limit should return a number", async () => {
    Model["$skip"] = 1;
    Model["$limit"] = 1;
    const result = await Model["max"]("age");

    expect(result).toEqual(expect.any(Number));
  });
});

describe("Model - min method", () => {
  test("should return a number", async () => {
    const result = await Model["min"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip should return a number", async () => {
    Model["$skip"] = 1;
    const result = await Model["min"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $limit should return a number", async () => {
    Model["$limit"] = 1;
    const result = await Model["min"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip and $limit should return a number", async () => {
    Model["$skip"] = 1;
    Model["$limit"] = 1;
    const result = await Model["min"]("age");

    expect(result).toEqual(expect.any(Number));
  });
});

describe("Model - avg method", () => {
  test("should return a number", async () => {
    const result = await Model["avg"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip should return a number", async () => {
    Model["$skip"] = 1;
    const result = await Model["avg"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $limit should return a number", async () => {
    Model["$limit"] = 1;
    const result = await Model["avg"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip and $limit should return a number", async () => {
    Model["$skip"] = 1;
    Model["$limit"] = 1;
    const result = await Model["avg"]("age");

    expect(result).toEqual(expect.any(Number));
  });
});

describe("Model - sum method", () => {
  test("should return a number", async () => {
    const result = await Model["sum"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip should return a number", async () => {
    Model["$skip"] = 1;
    const result = await Model["sum"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $limit should return a number", async () => {
    Model["$limit"] = 1;
    const result = await Model["sum"]("age");

    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip and $limit should return a number", async () => {
    Model["$skip"] = 1;
    Model["$limit"] = 1;
    const result = await Model["sum"]("age");

    expect(result).toEqual(expect.any(Number));
  });
});

describe("Model - count method", () => {
  test("should return a number", async () => {
    const result = await Model["count"]();
    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip should return a number", async () => {
    Model["$skip"] = 1;
    const result = await Model["count"]();

    expect(result).toEqual(expect.any(Number));
  });

  test("with $limit should return a number", async () => {
    Model["$limit"] = 1;
    const result = await Model["count"]();

    expect(result).toEqual(expect.any(Number));
  });

  test("with $skip and $limit should return a number", async () => {
    Model["$skip"] = 1;
    Model["$limit"] = 1;
    const result = await Model["count"]();

    expect(result).toEqual(expect.any(Number));
  });
});

describe("Model - pluck method", () => {
  test("should return an array", async () => {
    const result = await Model["pluck"]("name");
    expect(result).toEqual(expect.any(Array));
  });

  test("with $skip should return an array", async () => {
    Model["$skip"] = 1;
    const result = await Model["pluck"]("name");

    expect(result).toEqual(expect.any(Array));
  });

  test("with $limit should return an array", async () => {
    Model["$limit"] = 1;
    const result = await Model["pluck"]("name");

    expect(result).toEqual(expect.any(Array));
  });

  test("with $skip and $limit should return an array", async () => {
    Model["$skip"] = 1;
    Model["$limit"] = 1;
    const result = await Model["pluck"]("name");

    expect(result).toEqual(expect.any(Array));
  });
});

describe("Model - create method", () => {
  test("should return an object", async () => {
    const result = await Model["create"]({
      name: "John Doe",
      age: 25,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
  });
});

describe("Model - insert method", () => {
  test("should return an object", async () => {
    const result = await Model["insert"]({
      name: "John Doe",
      age: 25,
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("_id");
  });
});

describe("Model - insertMany method", () => {
  test("should return an object", async () => {
    const result = await Model["insertMany"]([
      {
        name: "John Doe",
        age: 25,
      },
      {
        name: "Jane Doe",
        age: 26,
      },
    ]);

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("insertedCount");
  });
});

describe("Model - update method", () => {
  test("should return an object", async () => {
    const result = await Model["update"]({ age: 26 });

    expect(result).toEqual(expect.any(Object));
  });

  test("with send property _id should return an object", async () => {
    const result = await Model["update"]({
      age: 27,
      _id: "5f0f5d8f5c5e7d4e0b0e3f0b",
    });

    expect(result).toEqual(expect.any(Object));
  });

  test("with send property createdAt should return an object", async () => {
    const result = await Model["update"]({
      age: 27,
      createdAt: new Date(),
    });

    expect(result).toEqual(expect.any(Object));
  });
});

describe("Model - updateMany method", () => {
  test("should return an object", async () => {
    const result = await Model.where("age", 26).updateMany({ age: 27 });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount");
  });

  test("with send property _id should return an object", async () => {
    const result = await Model.where("age", 26).updateMany({
      age: 27,
      _id: "5f0f5d8f5c5e7d4e0b0e3f0b",
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount");
  });

  test("with send property createdAt should return an object", async () => {
    const result = await Model.where("age", 26).updateMany({
      age: 27,
      createdAt: new Date(),
    });

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount");
  });
});

describe("Model - delete method", () => {
  test("should return an object", async () => {
    Model["softDelete"] = false;
    const result = await Model.delete();
    expect(result).toEqual(expect.any(Object));
  });

  test("with softDelete should return an object", async () => {
    Model["softDelete"] = true;
    const result = await Model.delete();
    expect(result).toEqual(expect.any(Object));
  });
});

describe("Model - deleteMany method", () => {
  test("return an object", async () => {
    Model["softDelete"] = false;
    const result = await Model.where("age", 26).deleteMany();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount");
  });

  test("with softDelete should return an object", async () => {
    Model["softDelete"] = true;
    const result = await Model.where("age", 26).deleteMany();

    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount");
  });
});

describe("Model - forceDelete method", () => {
  test("should return an object", async () => {
    const result = await Model.forceDelete();
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("deletedCount");
  });
});

describe("Model - restore method", () => {
  test("should return an object", async () => {
    const result = await Model.restore();
    expect(result).toEqual(expect.any(Object));
    expect(result).toHaveProperty("modifiedCount");
  });
});

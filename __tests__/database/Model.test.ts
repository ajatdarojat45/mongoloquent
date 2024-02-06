import { ObjectId } from "mongodb";
import Model from "../../src/database/Model";

describe("Model - get method", () => {
  test("should return an array", async () => {
    const result = await Model["get"]();

    expect(result).toEqual(expect.any(Array));
  });

  test("with selected fields should return an array", async () => {
    const result = await Model["get"](["name", "email"]);

    expect(result).toEqual(expect.any(Array));
  });

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "get").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["get"]()).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["get"].mockRestore();
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

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "first").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["first"]()).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["first"].mockRestore();
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

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "find").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["find"]("5f0f5d8f5c5e7d4e0b0e3f0b")).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["find"].mockRestore();
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

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "paginate").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["paginate"]()).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["paginate"].mockRestore();
  });
});

describe("Model - aggregate method", () => {
  test("should return an aggregate cursor", () => {
    const result = Model["aggregate"]();
    expect(result).toEqual(expect.any(Object));
  });

  test("should throw an error", () => {
    jest.spyOn(Model as any, "aggregate").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["aggregate"]()).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["aggregate"].mockRestore();
  });
});

describe("Model - max method", () => {
  test("should return a number", async () => {
    const result = await Model["max"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "max").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["max"]("age")).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["max"].mockRestore();
  });
});

describe("Model - min method", () => {
  test("should return a number", async () => {
    const result = await Model["min"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "min").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["min"]("age")).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["min"].mockRestore();
  });
});

describe("Model - avg method", () => {
  test("should return a number", async () => {
    const result = await Model["avg"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "avg").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["avg"]("age")).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["avg"].mockRestore();
  });
});

describe("Model - sum method", () => {
  test("should return a number", async () => {
    const result = await Model["sum"]("age");
    expect(result).toEqual(expect.any(Number));
  });

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "sum").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["sum"]("age")).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["sum"].mockRestore();
  });
});

describe("Model - count method", () => {
  test("should return a number", async () => {
    const result = await Model["count"]();
    expect(result).toEqual(expect.any(Number));
  });

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "count").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["count"]()).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["count"].mockRestore();
  });
});

describe("Model - pluck method", () => {
  test("should return an array", async () => {
    const result = await Model["pluck"]("name");
    expect(result).toEqual(expect.any(Array));
  });

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "pluck").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() => Model["pluck"]("name")).toThrowError(
      "Mongoloquent failed to get data..."
    );

    (Model as any)["pluck"].mockRestore();
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

  test("should throw an error", async () => {
    jest.spyOn(Model as any, "create").mockImplementation(() => {
      throw new Error("Mongoloquent failed to get data...");
    });

    expect(() =>
      Model["create"]({
        name: "John Doe",
        age: 25,
      })
    ).toThrowError("Mongoloquent failed to get data...");

    (Model as any)["create"].mockRestore();
  });
});

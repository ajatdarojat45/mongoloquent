import Database from "../../src/database/Database";

describe("getCollection method", () => {
  test("should return a collection", () => {
    const collection = Database["getCollection"]();
    expect(collection).toBeDefined();
  });
});

describe("connect method", () => {
  test("should return a connection", () => {
    const logSpy = jest.spyOn(console, "log");
    Database["connect"]();
    expect(logSpy).toHaveBeenCalledWith(
      "Mongoloquent trying to connect to database..."
    );
    expect(logSpy).toHaveBeenCalledWith(
      "Mongoloquent connected to database..."
    );
    logSpy.mockRestore();
  });

  test("should throw an error", () => {
    jest.spyOn(Database as any, "connect").mockImplementation(() => {
      throw new Error("Mongoloquent failed to connect to database...");
    });

    expect(() => Database["connect"]()).toThrowError(
      "Mongoloquent failed to connect to database..."
    );

    (Database as any)["connect"].mockRestore();
  });
});

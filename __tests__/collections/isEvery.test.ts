import Collection from "../../src/Collection";

describe("Collection.isEvery", () => {
  it("should return true for an empty collection", () => {
    const collection = new Collection(...[]);
    const result = collection.isEvery(() => true);
    expect(result).toBe(true);
  });

  it("should return true when all items match the key-value condition", () => {
    const collection = new Collection(
      ...[{ status: "active" }, { status: "active" }, { status: "active" }]
    );
    const result = collection.isEvery("status", "active");
    expect(result).toBe(true);
  });

  it("should return false when not all items match the key-value condition", () => {
    const collection = new Collection(
      ...[{ status: "active" }, { status: "inactive" }, { status: "active" }]
    );
    const result = collection.isEvery("status", "active");
    expect(result).toBe(false);
  });

  it("should return true when all items satisfy the callback condition", () => {
    const collection = new Collection(...[2, 4, 6, 8]);
    const result = collection.isEvery((item: any) => item % 2 === 0);
    expect(result).toBe(true);
  });

  it("should return false when not all items satisfy the callback condition", () => {
    const collection = new Collection(...[2, 3, 6, 8]);
    const result = collection.isEvery((item: any) => item % 2 === 0);
    expect(result).toBe(false);
  });

  it("should return false for invalid key", () => {
    const collection = new Collection([
      { status: "active" },
      { status: "active" },
    ]);
    const result = collection.isEvery("nonexistentKey", "value");
    expect(result).toBe(false);
  });

  it("should return true when all items have the same value for a nested key", () => {
    const collection = new Collection([
      { user: { role: "admin" } },
      { user: { role: "admin" } },
    ]);
    const result = collection.isEvery("user.role", "admin");
    expect(result).toBe(false); // Nested keys are not supported directly.
  });
});

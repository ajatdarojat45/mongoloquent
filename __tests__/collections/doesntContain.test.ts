import Collection from "../../src/Collection";

describe("Collection.doesntContain", () => {
  it("should return true when no items match the predicate function", () => {
    const collection = new Collection(1, 2, 3, 4);
    const result = collection.doesntContain((item) => item > 4);
    expect(result).toBe(true);
  });

  it("should return false when some items match the predicate function", () => {
    const collection = new Collection(1, 2, 3, 4);
    const result = collection.doesntContain((item) => item > 2);
    expect(result).toBe(false);
  });

  it("should return true when no items match the key-value pair", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    const result = collection.doesntContain("name", "Charlie");
    expect(result).toBe(true);
  });

  it("should return false when some items match the key-value pair", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    const result = collection.doesntContain("name", "Alice");
    expect(result).toBe(false);
  });

  it("should return true for an empty collection", () => {
    const collection = new Collection<number>();
    const result = collection.doesntContain((item) => item > 0);
    expect(result).toBe(true);
  });
});

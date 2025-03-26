import Collection from "../../src/Collection";

describe("Collection.whereIn", () => {
  it("should filter items where the key's value is in the provided array", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );

    const result = collection.whereIn("id", [1, 3]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { id: 1, name: "Alice" },
        { id: 3, name: "Charlie" },
      ])
    );
  });

  it("should return an empty collection if no items match", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );

    const result = collection.whereIn("id", [4, 5]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should return an empty collection if the provided array is empty", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );

    const result = collection.whereIn("id", []);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should handle non-numeric values correctly", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );

    const result = collection.whereIn("name", ["Alice", "Charlie"]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { id: 1, name: "Alice" },
        { id: 3, name: "Charlie" },
      ])
    );
  });

  it("should work with mixed data types in the array", () => {
    const collection = new Collection(
      { id: 1, value: "Alice" },
      { id: 2, value: 42 },
      { id: 3, value: true }
    );

    const result = collection.whereIn("value", ["Alice", 42]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { id: 1, value: "Alice" },
        { id: 2, value: 42 },
      ])
    );
  });
});

import Collection from "../../src/Collection";

describe("Collection.pull", () => {
  it("should remove and return the value of the specified key", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );

    const result = collection.pull("name");
    expect(result).toBe("Alice");
    expect(collection).toHaveLength(2);
    expect(collection).not.toContainEqual({ id: 1, name: "Alice" });
  });

  it("should return null if the key does not exist in any item", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );

    // @ts-ignore
    const result = collection.pull("age");
    expect(result).toBeNull();
    expect(collection).toHaveLength(2);
  });

  it("should remove only the first item with the specified key", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Alice" },
      { id: 3, name: "Charlie" }
    );

    const result = collection.pull("name");
    expect(result).toBe("Alice");
    expect(collection).toHaveLength(2);
    expect(collection).toContainEqual({ id: 2, name: "Alice" });
  });

  it("should return null when called on an empty collection", () => {
    const collection = new Collection();

    //@ts-ignore
    const result = collection.pull("name");
    expect(result).toBeNull();
    expect(collection).toHaveLength(0);
  });

  it("should handle keys with null or undefined values", () => {
    const collection = new Collection(
      { id: 1, name: null },
      { id: 2, name: undefined },
      { id: 3, name: "Charlie" }
    );

    const result = collection.pull("name");
    expect(result).toBeNull();
    expect(collection).toHaveLength(2);
    expect(collection).not.toContainEqual({ id: 1, name: null });
  });
});

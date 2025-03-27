import Collection from "../../src/Collection";

describe("Collection.get", () => {
  let collection: Collection<{ id: number; name?: string }>;

  beforeEach(() => {
    collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2 },
      { id: 3, name: "Charlie" }
    );
  });

  it("should return the value of an existing key", () => {
    const result = collection.get("name");
    expect(result).toBe("Alice");
  });

  it("should return null for a non-existing key with no default value", () => {
    const result = collection.get("nonExistentKey");
    expect(result).toBeNull();
  });

  it("should return undefined if the key exists but the value is undefined", () => {
    const result = collection.get("name", null);
    expect(result).toBe("Alice");
  });

  it("should return null if the key exists but the value is undefined", () => {
    const result = collection.get("name", null);
    expect(result).toBe("Alice");
  });
});

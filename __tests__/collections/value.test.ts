import Collection from "../../src/Collection";

describe("Collection.value", () => {
  it("should return undefined when the collection is empty", () => {
    const collection = new Collection<{ id: number; name: string }>();
    const result = collection.value("id");
    expect(result).toBeUndefined();
  });

  it("should return the value of the specified key from the first element", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    const result = collection.value("name");
    expect(result).toBe("Alice");
  });

  it("should return undefined if the specified key does not exist in the first element", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    // @ts-ignore
    const result = collection.value("age");
    expect(result).toBeUndefined();
  });

  it("should handle collections with non-object elements gracefully", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.value("id" as any);
    expect(result).toBeUndefined();
  });
});

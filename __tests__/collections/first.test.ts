import Collection from "../../src/Collection";

describe("Collection.first", () => {
  it("should return null when the collection is empty", () => {
    const collection = new Collection<number>();
    const result = collection.first();
    expect(result).toBeNull();
  });

  it("should return the first element when no predicate is provided", () => {
    const collection = new Collection<number>(1, 2, 3);
    const result = collection.first();
    expect(result).toBe(1);
  });

  it("should return the first element that matches the predicate", () => {
    const collection = new Collection<number>(1, 2, 3, 4);
    const result = collection.first((item) => item > 2);
    expect(result).toBe(3);
  });

  it("should return null when no elements match the predicate", () => {
    const collection = new Collection<number>(1, 2, 3);
    const result = collection.first((item) => item > 5);
    expect(result).toBeNull();
  });

  it("should return the first element when the predicate matches the first element", () => {
    const collection = new Collection<number>(1, 2, 3);
    const result = collection.first((item) => item === 1);
    expect(result).toBe(1);
  });

  it("should return the first matching element when the predicate matches a middle element", () => {
    const collection = new Collection<number>(1, 2, 3, 4);
    const result = collection.first((item) => item === 3);
    expect(result).toBe(3);
  });

  it("should work with complex objects and predicates", () => {
    const collection = new Collection<{ id: number; name: string }>(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );
    const result = collection.first((item) => item.name === "Bob");
    expect(result).toEqual({ id: 2, name: "Bob" });
  });

  it("should return null when the predicate is provided but the collection is empty", () => {
    const collection = new Collection<number>();
    const result = collection.first((item) => item > 0);
    expect(result).toBeNull();
  });
});

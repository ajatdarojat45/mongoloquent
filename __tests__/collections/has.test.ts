import Collection from "../../src/Collection";

describe("Collection.has", () => {
  it("should return true if a single key exists in the collection", () => {
    const collection = new Collection(
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 }
    );

    expect(collection.has("name")).toBe(true);
    expect(collection.has("age")).toBe(true);
  });

  it("should return false if a single key does not exist in the collection", () => {
    const collection = new Collection(
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 }
    );

    expect(collection.has("address")).toBe(false);
  });

  it("should return true if all keys in an array exist in the collection", () => {
    const collection = new Collection(
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 }
    );

    expect(collection.has(["name", "age"])).toBe(true);
  });

  it("should return false if at least one key in an array does not exist in the collection", () => {
    const collection = new Collection(
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 }
    );

    expect(collection.has(["name", "address"])).toBe(false);
  });

  it("should return false for an empty collection", () => {
    const collection = new Collection();

    expect(collection.has("name")).toBe(false);
    expect(collection.has(["name", "age"])).toBe(false);
  });

  it("should handle invalid input gracefully", () => {
    const collection = new Collection(
      { name: "Alice", age: 25 },
      { name: "Bob", age: 30 }
    );

    // @ts-expect-error Testing invalid input
    expect(collection.has(123)).toBe(false);
    // @ts-expect-error Testing invalid input
    expect(collection.has(null)).toBe(false);
    // @ts-expect-error Testing invalid input
    expect(collection.has(undefined)).toBe(false);
  });
});

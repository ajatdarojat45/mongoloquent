import Collection from "../../src/Collection";

describe("Collection.hasAny", () => {
  it("should return true if a single key exists in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    expect(collection.hasAny("id")).toBe(true);
  });

  it("should return true if at least one key exists in the collection (multiple keys)", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    expect(collection.hasAny(["id", "age"])).toBe(true);
  });

  it("should return false if none of the keys exist in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    expect(collection.hasAny("age")).toBe(false);
  });

  it("should return true if some keys exist and some don't", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    expect(collection.hasAny(["id", "nonExistentKey"])).toBe(true);
  });

  it("should return false for an empty collection", () => {
    const collection = new Collection();
    expect(collection.hasAny("id")).toBe(false);
  });

  it("should handle invalid input gracefully", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    // @ts-ignore
    expect(collection.hasAny(123)).toBe(false); // Non-string key
  });
});

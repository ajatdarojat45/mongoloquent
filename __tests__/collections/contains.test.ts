import Collection from "../../src/Collection";

describe("Collection.contains", () => {
  it("should return true when a callback function matches an item", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.contains((item) => item.id === 2);
    expect(result).toBe(true);
  });

  it("should return false when a callback function does not match any item", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.contains((item) => item.id === 4);
    expect(result).toBe(false);
  });

  it("should return true when a key-value pair matches an item (loose equality)", () => {
    const collection = new Collection([{ id: "1" }, { id: 2 }, { id: 3 }]);
    const result = collection.contains("id", 1); // Loose equality
    expect(result).toBe(true);
  });

  it("should return false when a key-value pair does not match any item", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.contains("id", 4);
    expect(result).toBe(false);
  });

  it("should return true when a key-value pair matches an item with null or undefined", () => {
    const collection = new Collection([
      { id: null },
      { id: undefined },
      { id: 3 },
    ]);
    expect(collection.contains("id", null)).toBe(true);
    expect(collection.contains("id", undefined)).toBe(true);
  });

  it("should return false when called on an empty collection", () => {
    const collection = new Collection([]);
    const result = collection.contains("id", 1);
    expect(result).toBe(false);
  });
});

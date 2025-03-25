import Collection from "../../src/Collection";

describe("Collection.containsStrict", () => {
  it("should return true when a callback function matches an item", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.containsStrict((item) => item.id === 2);
    expect(result).toBe(true);
  });

  it("should return false when a callback function does not match any item", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.containsStrict((item) => item.id === 4);
    expect(result).toBe(false);
  });

  it("should return true when a key-value pair matches an item (strict equality)", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.containsStrict("id", 2);
    expect(result).toBe(true);
  });

  it("should return false when a key-value pair does not match any item", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.containsStrict("id", 4);
    expect(result).toBe(false);
  });

  it("should return false when a key-value pair matches loosely but not strictly", () => {
    const collection = new Collection([{ id: "1" }, { id: 2 }, { id: 3 }]);
    const result = collection.containsStrict("id", 1); // Strict equality fails
    expect(result).toBe(false);
  });

  it("should return true when a key-value pair matches an item with null or undefined", () => {
    const collection = new Collection([
      { id: null },
      { id: undefined },
      { id: 3 },
    ]);
    expect(collection.containsStrict("id", null)).toBe(true);
    expect(collection.containsStrict("id", undefined)).toBe(true);
  });

  it("should return false when called on an empty collection", () => {
    const collection = new Collection([]);
    const result = collection.containsStrict("id", 1);
    expect(result).toBe(false);
  });
});

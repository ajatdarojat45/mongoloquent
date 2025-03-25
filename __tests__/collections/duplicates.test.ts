import Collection from "../../src/Collection";

describe("Collection.duplicates", () => {
  it("should return an empty object when there are no duplicates", () => {
    const collection = new Collection([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.duplicates("id");
    expect(result).toEqual({});
  });

  it("should return correct duplicates for a given key", () => {
    const collection = new Collection([
      { id: 1 },
      { id: 2 },
      { id: 1 },
      { id: 3 },
      { id: 2 },
    ]);
    const result = collection.duplicates("id");
    expect(result).toEqual({ 1: 2, 2: 2 });
  });

  it("should handle multiple duplicate values", () => {
    const collection = new Collection([
      { id: 1 },
      { id: 2 },
      { id: 1 },
      { id: 3 },
      { id: 2 },
      { id: 3 },
      { id: 3 },
    ]);
    const result = collection.duplicates("id");
    expect(result).toEqual({ 1: 2, 2: 2, 3: 3 });
  });

  it("should work with string values", () => {
    const collection = new Collection([
      { name: "Alice" },
      { name: "Bob" },
      { name: "Alice" },
      { name: "Charlie" },
      { name: "Bob" },
    ]);
    const result = collection.duplicates("name");
    expect(result).toEqual({ Alice: 2, Bob: 2 });
  });

  it("should handle an empty collection", () => {
    const collection = new Collection([]);
    const result = collection.duplicates("id");
    expect(result).toEqual({});
  });

  it("should handle a collection with only one item", () => {
    const collection = new Collection([{ id: 1 }]);
    const result = collection.duplicates("id");
    expect(result).toEqual({});
  });
});

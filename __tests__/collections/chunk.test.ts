import Collection from "../../src/Collection";

describe("Collection.before", () => {
  it("should return the item before the matching item using a key and strict comparison", () => {
    const collection = new Collection([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ]);

    const result = collection.before("id", 3, true);
    expect(result).toEqual({ id: 2, name: "Bob" });
  });

  it("should return the item before the matching item using a key and loose comparison", () => {
    const collection = new Collection([
      { id: "1", name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ]);

    const result = collection.before("id", "3", false);
    expect(result).toEqual({ id: 2, name: "Bob" });
  });

  it("should return the item before the matching item using a callback function", () => {
    const collection = new Collection([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ]);

    const result = collection.before((item) => item.name === "Charlie");
    expect(result).toEqual({ id: 2, name: "Bob" });
  });

  it("should return null when the matching item is the first element", () => {
    const collection = new Collection([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ]);

    const result = collection.before("id", 1, true);
    expect(result).toBeNull();
  });

  it("should return null when no matching item is found", () => {
    const collection = new Collection([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ]);

    const result = collection.before("id", 4, true);
    expect(result).toBeNull();
  });

  it("should return null when the collection is empty", () => {
    const collection = new Collection([]);

    const result = collection.before("id", 1, true);
    expect(result).toBeNull();
  });
});

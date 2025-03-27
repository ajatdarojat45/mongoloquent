import Collection from "../../src/Collection";

describe("Collection.whereNotIn", () => {
  it("filters objects based on a key", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );
    const result = collection.whereNotIn("id", [2]);
    expect(result).toEqual(
      new Collection({ id: 1, name: "Alice" }, { id: 3, name: "Charlie" })
    );
  });

  it("returns the same collection when the exclusion list is empty", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.whereNotIn("valueOf", []);
    expect(result).toEqual(collection);
  });

  it("handles null and undefined values", () => {
    const collection = new Collection(
      { id: 1, value: null },
      { id: 2, value: undefined },
      { id: 3, value: 42 }
    );
    const result = collection.whereNotIn("value", [null, undefined]);
    expect(result).toEqual(new Collection({ id: 3, value: 42 }));
  });

  it("returns the same collection when the key does not exist", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    // @ts-ignore
    const result = collection.whereNotIn("age", [30]);
    expect(result).toEqual(collection);
  });
});

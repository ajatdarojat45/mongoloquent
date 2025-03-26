import Collection from "../../src/Collection";

describe("Collection.unique", () => {
  it("should remove duplicate primitive values", () => {
    const collection = new Collection(1, 2, 2, 3, 4, 4, 5);
    const uniqueCollection = collection.unique();
    expect(uniqueCollection).toEqual(new Collection(1, 2, 3, 4, 5));
  });

  it("should handle an empty collection", () => {
    const collection = new Collection();
    const uniqueCollection = collection.unique();
    expect(uniqueCollection).toEqual(new Collection());
  });

  it("should remove duplicate objects based on a key", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
      { id: 3, name: "Charlie" }
    );
    const uniqueCollection = collection.unique("id");
    expect(uniqueCollection).toEqual(
      new Collection(
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" }
      )
    );
  });

  it("should remove duplicate objects based on a callback", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Alice" },
      { id: 4, name: "Charlie" }
    );
    const uniqueCollection = collection.unique((item) => item.name);
    expect(uniqueCollection).toEqual(
      new Collection(
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 4, name: "Charlie" }
      )
    );
  });

  it("should handle a collection with no duplicates", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const uniqueCollection = collection.unique();
    expect(uniqueCollection).toEqual(new Collection(1, 2, 3, 4, 5));
  });

  it("should handle mixed types in the collection", () => {
    // @ts-ignore
    const collection = new Collection(1, "1", 2, "2", 1, "1");
    const uniqueCollection = collection.unique();
    // @ts-ignore
    expect(uniqueCollection).toEqual(new Collection(1, "1", 2, "2"));
  });
});

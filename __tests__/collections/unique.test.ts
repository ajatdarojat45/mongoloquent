import Collection from "../../src/Collection";

describe("Collection.unique", () => {
  it("should return unique values without parameters", () => {
    const collection = new Collection(1, 2, 2, 3, 3, 3, 4);
    const uniqueCollection = collection.unique();
    expect(uniqueCollection).toEqual(new Collection(1, 2, 3, 4));
  });

  it("should return unique objects based on a key", () => {
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

  it("should return unique objects based on a callback", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
      { id: 3, name: "Charlie" }
    );
    const uniqueCollection = collection.unique((item) => item.name);
    expect(uniqueCollection).toEqual(
      new Collection(
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" }
      )
    );
  });

  it("should return an empty collection when the input is empty", () => {
    const collection = new Collection();
    const uniqueCollection = collection.unique();
    expect(uniqueCollection).toEqual(new Collection());
  });

  it("should return the same collection when all values are unique", () => {
    const collection = new Collection(1, 2, 3, 4);
    const uniqueCollection = collection.unique();
    expect(uniqueCollection).toEqual(new Collection(1, 2, 3, 4));
  });

  it("should return a single value when all values are duplicates", () => {
    const collection = new Collection(5, 5, 5, 5);
    const uniqueCollection = collection.unique();
    expect(uniqueCollection).toEqual(new Collection(5));
  });
});

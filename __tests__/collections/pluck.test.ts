import Collection from "../../src/Collection";

describe("Collection.pluck", () => {
  it("should pluck a single key from objects in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 }
    );

    const result = collection.pluck("name");
    expect(result).toEqual(new Collection("Alice", "Bob", "Charlie"));
  });

  it("should pluck multiple keys from objects in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 }
    );

    const result = collection.pluck(["id", "name"]);
    expect(result).toEqual(
      new Collection(
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" }
      )
    );
  });

  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection();

    // @ts-ignore
    const result = collection.pluck("name");
    expect(result).toEqual(new Collection());
  });

  it("should return undefined for invalid keys when plucking a single key", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    // @ts-ignore
    const result = collection.pluck("nonexistentKey");
    expect(result).toEqual(new Collection(undefined, undefined));
  });

  it("should return partial objects with undefined values for invalid keys when plucking multiple keys", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    // @ts-ignore
    const result = collection.pluck(["id", "nonexistentKey"]);
    expect(result).toEqual(
      new Collection(
        { id: 1, nonexistentKey: undefined },
        { id: 2, nonexistentKey: undefined }
      )
    );
  });

  it("should handle nested objects when plucking keys", () => {
    const collection = new Collection(
      { id: 1, profile: { name: "Alice", age: 25 } },
      { id: 2, profile: { name: "Bob", age: 30 } }
    );

    const result = collection.pluck("profile");
    expect(result).toEqual(
      new Collection({ name: "Alice", age: 25 }, { name: "Bob", age: 30 })
    );
  });
});

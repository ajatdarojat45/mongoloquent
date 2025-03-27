import Collection from "../../src/Collection";

describe("Collection.forget", () => {
  it("should remove a single key from all objects in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    collection.forget("age");

    expect(collection).toEqual([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  });

  it("should remove multiple keys from all objects in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25, city: "NY" },
      { id: 2, name: "Bob", age: 30, city: "LA" }
    );

    collection.forget(["age", "city"]);

    expect(collection).toEqual([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  });

  it("should handle an empty collection without errors", () => {
    const collection = new Collection<{ age: number }>();

    collection.forget("age");

    expect(collection).toEqual([]);
  });

  it("should handle an empty array of keys without errors", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    collection.forget([]);

    expect(collection).toEqual([
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
    ]);
  });
});

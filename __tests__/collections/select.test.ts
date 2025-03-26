import Collection from "../../src/Collection";

describe("Collection.select", () => {
  it("should select a single key from objects in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    const result = collection.select("name");

    expect(result).toEqual(new Collection({ name: "Alice" }, { name: "Bob" }));
  });

  it("should select multiple keys from objects in the collection", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    const result = collection.select(["id", "name"]);

    expect(result).toEqual(
      new Collection({ id: 1, name: "Alice" }, { id: 2, name: "Bob" })
    );
  });

  it("should handle selecting keys that do not exist in the objects", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    const result = collection.select(["name", "nonExistentKey"]);

    expect(result).toEqual(new Collection({ name: "Alice" }, { name: "Bob" }));
  });

  it("should return an empty collection when selecting keys from an empty collection", () => {
    const collection = new Collection();

    const result = collection.select("name");

    expect(result).toEqual(new Collection());
  });
});

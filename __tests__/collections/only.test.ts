import Collection from "../../src/Collection";

describe("Collection.only", () => {
  it("should return a new Collection with only the specified keys", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 }
    );

    const result = collection.only(["id", "name"]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toEqual(
      new Collection(
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" }
      )
    );
  });

  it("should return an empty Collection when called on an empty array", () => {
    const collection = new Collection();
    const result = collection.only(["id", "name"]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should return objects with only the specified keys, ignoring missing keys", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2 },
      { name: "Charlie", age: 35 }
    );

    const result = collection.only(["id", "name"]);

    expect(result).toEqual(
      new Collection({ id: 1, name: "Alice" }, { id: 2 }, { name: "Charlie" })
    );
  });

  it("should handle mixed data types and only filter objects", () => {
    const collection = new Collection(
      //@ts-ignore
      { id: 1, name: "Alice" },
      "string",
      42,
      null,
      { id: 2, name: "Bob" }
    );

    const result = collection.only(["id"]);

    expect(result).toEqual(
      //@ts-ignore
      new Collection({ id: 1 }, "string", 42, null, { id: 2 })
    );
  });

  it("should not include nested object keys", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", details: { age: 25 } },
      { id: 2, name: "Bob", details: { age: 30 } }
    );

    const result = collection.only(["id", "details"]);

    expect(result).toEqual(
      new Collection(
        { id: 1, details: { age: 25 } },
        { id: 2, details: { age: 30 } }
      )
    );
  });

  it("should return an empty Collection when keys array is empty", () => {
    const collection = new Collection(
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 }
    );

    const result = collection.only([]);

    expect(result).toEqual(new Collection({}, {}));
  });
});

import Collection from "../../src/Collection";

describe("Collection.whereNotNull", () => {
  it("should filter out items where the specified key is null", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: null },
      { id: 3, name: "Bob" }
    );

    const result = collection.whereNotNull("name");

    expect(result).toEqual(
      new Collection({ id: 1, name: "Alice" }, { id: 3, name: "Bob" })
    );
  });

  it("should filter out items where the specified key is undefined", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2 },
      { id: 3, name: "Bob" }
    );

    const result = collection.whereNotNull("name");

    expect(result).toEqual(
      new Collection({ id: 1, name: "Alice" }, { id: 3, name: "Bob" })
    );
  });

  it("should return an empty collection if all items have null or undefined values for the key", () => {
    const collection = new Collection(
      { id: 1, name: null },
      { id: 2, name: undefined }
    );

    const result = collection.whereNotNull("name");

    expect(result).toEqual(new Collection());
  });

  it("should return the same collection if no items have null or undefined values for the key", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );

    const result = collection.whereNotNull("name");

    expect(result).toEqual(collection);
  });

  it("should handle collections with mixed types", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: null },
      { id: 3, name: undefined },
      { id: 4, name: 0 },
      { id: 5, name: false }
    );

    const result = collection.whereNotNull("name");

    expect(result).toEqual(
      new Collection(
        { id: 1, name: "Alice" },
        { id: 4, name: 0 },
        { id: 5, name: false }
      )
    );
  });

  it("should handle an empty collection", () => {
    const collection = new Collection();

    // @ts-ignore
    const result = collection.whereNotNull("name");

    expect(result).toEqual(new Collection());
  });

  it("should handle nested objects", () => {
    const collection = new Collection(
      { id: 1, details: { age: 25 } },
      { id: 2, details: null },
      { id: 3, details: { age: null } }
    );

    const result = collection.whereNotNull("details");

    expect(result).toEqual(
      new Collection(
        { id: 1, details: { age: 25 } },
        { id: 3, details: { age: null } }
      )
    );
  });

  it("should handle arrays of objects", () => {
    const collection = new Collection(
      { id: 1, tags: ["tag1", "tag2"] },
      { id: 2, tags: null },
      { id: 3, tags: [] }
    );

    const result = collection.whereNotNull("tags");

    expect(result).toEqual(
      new Collection({ id: 1, tags: ["tag1", "tag2"] }, { id: 3, tags: [] })
    );
  });
});

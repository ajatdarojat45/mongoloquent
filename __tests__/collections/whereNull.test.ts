import Collection from "../../src/Collection";

describe("Collection.whereNull", () => {
  it("should return items where the specified key is null", () => {
    const collection = new Collection(
      { id: 1, name: null },
      { id: 2, name: "John" },
      { id: 3, name: null }
    );

    const result = collection.whereNull("name");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { id: 1, name: null },
        { id: 3, name: null },
      ])
    );
  });

  it("should return an empty collection when no items have the specified key as null", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "John" },
      { id: 3, name: "Doe" }
    );

    const result = collection.whereNull("name");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should return an empty collection when the collection is empty", () => {
    const collection = new Collection();

    // @ts-ignore
    const result = collection.whereNull("name");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should return an empty collection when the specified key does not exist", () => {
    const collection = new Collection(
      { id: 1, age: 25 },
      { id: 2, age: 30 },
      { id: 3, age: 35 }
    );

    // @ts-ignore
    const result = collection.whereNull("name");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should not include items where the specified key is undefined", () => {
    const collection = new Collection(
      { id: 1, name: null },
      { id: 2 },
      { id: 3, name: "John" }
    );

    const result = collection.whereNull("name");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(1);
    expect(result).toEqual(expect.arrayContaining([{ id: 1, name: null }]));
  });
});

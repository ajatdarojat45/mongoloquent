import Collection from "../../src/Collection";

describe("Collection.mapWithKeys", () => {
  it("should map items to a new collection with keys and values from the callback", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    );
    const result = collection.mapWithKeys((item) => ({ [item.id]: item.name }));

    expect(result).toBeInstanceOf(Collection);
    expect(result).toEqual(Collection.make({ "1": "Alice", "2": "Bob" }));
  });

  it("should handle duplicate keys by overwriting the previous value", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 1, name: "Bob" }
    );
    const result = collection.mapWithKeys((item) => ({ [item.id]: item.name }));

    expect(result).toEqual(
      Collection.make({ "1": "Bob" }) // Last value overwrites the previous one
    );
  });

  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection<{ id: number; name: string }>();
    const result = collection.mapWithKeys((item) => ({ [item.id]: item.name }));

    expect(result).toBeInstanceOf(Collection);
    expect(result).toEqual(new Collection());
  });

  it("should handle complex objects as keys and values", () => {
    const collection = new Collection(
      { id: 1, data: { nested: "value1" } },
      { id: 2, data: { nested: "value2" } }
    );
    const result = collection.mapWithKeys((item) => ({
      [`key-${item.id}`]: item.data.nested,
    }));

    expect(result).toEqual(
      Collection.make({ "key-1": "value1", "key-2": "value2" })
    );
  });
});

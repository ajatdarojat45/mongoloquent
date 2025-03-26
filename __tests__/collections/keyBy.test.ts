import Collection from "../../src/Collection";

describe("Collection.keyBy", () => {
  it("should key items by a string key", () => {
    const collection = new Collection(
      { id: "a", value: 1 },
      { id: "b", value: 2 },
      { id: "c", value: 3 }
    );

    const result = collection.keyBy("id");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ id: "a", value: 1 });
    expect(result[1]).toEqual({ id: "b", value: 2 });
    expect(result[2]).toEqual({ id: "c", value: 3 });
  });

  it("should key items by a callback function", () => {
    const collection = new Collection(
      { id: "a", value: 1 },
      { id: "b", value: 2 },
      { id: "c", value: 3 }
    );

    const result = collection.keyBy((item) => `key-${item.value}`);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ id: "a", value: 1 });
    expect(result[1]).toEqual({ id: "b", value: 2 });
    expect(result[2]).toEqual({ id: "c", value: 3 });
  });

  it("should skip items where the key does not exist", () => {
    const collection = new Collection(
      { id: "a", value: 1 },
      { value: 2 },
      { id: "c", value: 3 }
    );

    const result = collection.keyBy("id");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "a", value: 1 });
    expect(result[1]).toEqual({ id: "c", value: 3 });
  });

  it("should overwrite duplicate keys", () => {
    const collection = new Collection(
      { id: "a", value: 1 },
      { id: "a", value: 2 },
      { id: "b", value: 3 }
    );

    const result = collection.keyBy("id");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "a", value: 2 });
    expect(result[1]).toEqual({ id: "b", value: 3 });
  });

  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection();

    const result = collection.keyBy("id");

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });
});

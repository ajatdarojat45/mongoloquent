import Collection from "../../src/Collection";

describe("Collection.whereBetween", () => {
  it("should return items within the specified range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.whereBetween("value", [15, 25]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 2, value: 20 });
  });

  it("should include items at the range boundaries", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.whereBetween("value", [10, 30]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 },
    ]);
  });

  it("should return an empty collection if no items match the range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.whereBetween("value", [40, 50]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should return an empty collection if the key does not exist", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    // @ts-ignore
    const result = collection.whereBetween("nonexistentKey", [10, 30]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should return an empty collection if the key's value is not numeric", () => {
    const collection = new Collection(
      { id: 1, value: "10" },
      { id: 2, value: "20" },
      { id: 3, value: "30" }
    );

    // @ts-ignore
    const result = collection.whereBetween("value", [10, 30]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should handle an empty collection gracefully", () => {
    const collection = new Collection();

    // @ts-ignore
    const result = collection.whereBetween("value", [10, 30]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });
});

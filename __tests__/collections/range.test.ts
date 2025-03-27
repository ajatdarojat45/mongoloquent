import Collection from "../../src/Collection";

describe("Collection.range", () => {
  it("should filter items within the specified range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.range("value", [15, 25]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 2, value: 20 });
  });

  it("should return an empty collection when no items match the range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.range("value", [35, 40]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should return an empty collection when the key does not exist", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    // @ts-ignore
    const result = collection.range("nonExistentKey", [10, 20]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should ignore non-numeric values for the specified key", () => {
    const collection = new Collection(
      { id: 1, value: "10" },
      { id: 2, value: 20 },
      { id: 3, value: "30" }
    );

    const result = collection.range("value", [15, 25]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 2, value: 20 });
  });

  it("should include items where the value equals the min or max of the range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.range("value", [10, 30]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 },
    ]);
  });

  it("should handle edge cases where min and max are the same", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.range("value", [20, 20]);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 2, value: 20 });
  });
});

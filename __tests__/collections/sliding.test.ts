import Collection from "../../src/Collection";

describe("Collection.sliding", () => {
  it("should return sliding windows with default step of 1", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.sliding(3);

    expect(result).toBeInstanceOf(Collection);
    expect(result.length).toBe(3);
    expect(result[0]).toEqual([1, 2, 3]);
    expect(result[1]).toEqual([2, 3, 4]);
    expect(result[2]).toEqual([3, 4, 5]);
  });

  it("should return sliding windows with a custom step", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.sliding(3, 2);

    expect(result).toBeInstanceOf(Collection);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual([1, 2, 3]);
    expect(result[1]).toEqual([3, 4, 5]);
  });

  it("should throw an error if size or step is negative", () => {
    const collection = new Collection(1, 2, 3, 4, 5);

    expect(() => collection.sliding(-3)).toThrowError(
      "Size and step must be positive numbers."
    );
    expect(() => collection.sliding(3, -1)).toThrowError(
      "Size and step must be positive numbers."
    );
    expect(() => collection.sliding(-3, -1)).toThrowError(
      "Size and step must be positive numbers."
    );
  });

  it("should return an empty collection if size is larger than the collection length", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.sliding(5);

    expect(result).toBeInstanceOf(Collection);
    expect(result.length).toBe(0);
  });

  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection();
    const result = collection.sliding(3);

    expect(result).toBeInstanceOf(Collection);
    expect(result.length).toBe(0);
  });

  it("should handle a step larger than the size", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.sliding(2, 3);

    expect(result).toBeInstanceOf(Collection);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([4, 5]);
  });
});

import Collection from "../../src/Collection";

describe("Collection.splitIn", () => {
  it("should split the collection into equal groups", () => {
    const collection = new Collection(1, 2, 3, 4, 5, 6);
    const result = collection.splitIn(3);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Collection(1, 2));
    expect(result[1]).toEqual(new Collection(3, 4));
    expect(result[2]).toEqual(new Collection(5, 6));
  });

  it("should split the collection into groups with a remainder", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.splitIn(3);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Collection(1, 2));
    expect(result[1]).toEqual(new Collection(3, 4));
    expect(result[2]).toEqual(new Collection(5));
  });

  it("should handle splitting into more groups than items", () => {
    const collection = new Collection(1, 2);
    const result = collection.splitIn(5);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual(new Collection(1));
    expect(result[1]).toEqual(new Collection(2));
    expect(result[2]).toEqual(new Collection());
    expect(result[3]).toEqual(new Collection());
    expect(result[4]).toEqual(new Collection());
  });

  it("should return the same collection when numGroups is 1", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.splitIn(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(collection);
  });

  it("should throw an error when numGroups is 0", () => {
    const collection = new Collection(1, 2, 3, 4, 5);

    expect(() => collection.splitIn(0)).toThrow(
      "The number of groups must be greater than zero."
    );
  });

  it("should return an empty array when splitting an empty collection", () => {
    const collection = new Collection();
    const result = collection.splitIn(3);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Collection());
    expect(result[1]).toEqual(new Collection());
    expect(result[2]).toEqual(new Collection());
  });
});

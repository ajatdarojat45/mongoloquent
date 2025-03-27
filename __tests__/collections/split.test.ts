import Collection from "../../src/Collection";
import { MongoloquentInvalidArgumentException } from "../../src/exceptions/MongoloquentException";

describe("Collection.split", () => {
  it("should split the collection into the specified number of groups", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.split(2);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(new Collection(1, 2, 3));
    expect(result[1]).toEqual(new Collection(4, 5));
  });

  it("should handle numGroups greater than the collection size", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.split(5);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Collection(1));
    expect(result[1]).toEqual(new Collection(2));
    expect(result[2]).toEqual(new Collection(3));
  });

  it("should return the same collection when numGroups is 1", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.split(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(collection);
  });

  it("should split into single-item groups when numGroups equals the collection size", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.split(3);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Collection(1));
    expect(result[1]).toEqual(new Collection(2));
    expect(result[2]).toEqual(new Collection(3));
  });

  it("should throw an exception when numGroups is 0 or negative", () => {
    const collection = new Collection(1, 2, 3);

    expect(() => collection.split(0)).toThrow(
      MongoloquentInvalidArgumentException
    );
    expect(() => collection.split(-1)).toThrow(
      MongoloquentInvalidArgumentException
    );
  });

  it("should return an empty array when splitting an empty collection", () => {
    const collection = new Collection();
    const result = collection.split(3);

    expect(result).toEqual([]);
  });
});

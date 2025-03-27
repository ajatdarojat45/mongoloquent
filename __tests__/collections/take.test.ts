import Collection from "../../src/Collection";

describe("Collection.take", () => {
  it("should take the first n elements when limit is positive", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.take(3);
    expect(result).toEqual(new Collection(1, 2, 3));
  });

  it("should take the last n elements when limit is negative", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.take(-2);
    expect(result).toEqual(new Collection(4, 5));
  });

  it("should return an empty collection when limit is zero", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.take(0);
    expect(result).toEqual(new Collection());
  });

  it("should return the entire collection when limit exceeds the collection size", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.take(10);
    expect(result).toEqual(new Collection(1, 2, 3));
  });

  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection();
    const result = collection.take(3);
    expect(result).toEqual(new Collection());
  });

  it("should handle negative limits larger than the collection size", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.take(-10);
    expect(result).toEqual(new Collection(1, 2, 3));
  });
});

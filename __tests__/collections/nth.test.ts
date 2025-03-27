import Collection from "../../src/Collection";

describe("Collection.nth", () => {
  it("should return every nth element with default offset", () => {
    const collection = new Collection(1, 2, 3, 4, 5, 6, 7, 8, 9);
    const result = collection.nth(3);
    expect(result).toEqual(new Collection(1, 4, 7));
  });

  it("should return every nth element with a custom offset", () => {
    const collection = new Collection(1, 2, 3, 4, 5, 6, 7, 8, 9);
    const result = collection.nth(3, 1);
    expect(result).toEqual(new Collection(2, 5, 8));
  });

  it("should return an empty collection when step is 0", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.nth(0);
    expect(result).toEqual(new Collection());
  });

  it("should return an empty collection when step is negative", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.nth(-2);
    expect(result).toEqual(new Collection());
  });

  it("should return an empty collection when the collection is empty", () => {
    const collection = new Collection();
    const result = collection.nth(3);
    expect(result).toEqual(new Collection());
  });

  it("should handle a single-element collection with step > 1", () => {
    const collection = new Collection(1);
    const result = collection.nth(2);
    expect(result).toEqual(new Collection());
  });

  it("should handle a single-element collection with step = 1", () => {
    const collection = new Collection(1);
    const result = collection.nth(1);
    expect(result).toEqual(new Collection(1));
  });

  it("should handle a single-element collection with offset > 0", () => {
    const collection = new Collection(1);
    const result = collection.nth(1, 1);
    expect(result).toEqual(new Collection());
  });

  it("should handle a collection with step larger than its length", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.nth(5);
    expect(result).toEqual(new Collection(1));
  });

  it("should handle a collection with offset larger than its length", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.nth(2, 5);
    expect(result).toEqual(new Collection());
  });
});

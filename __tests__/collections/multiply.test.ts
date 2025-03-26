import Collection from "../../src/Collection";

describe("Collection.multiply", () => {
  it("should return an empty collection when multiplying an empty collection", () => {
    const collection = new Collection<number>();
    const result = collection.multiply(3);
    expect(result).toEqual(new Collection());
  });

  it("should return an empty collection when multiplying with times = 0", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.multiply(0);
    expect(result).toEqual(new Collection());
  });

  it("should return the same collection when multiplying with times = 1", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.multiply(1);
    expect(result).toEqual(new Collection(1, 2, 3));
  });

  it("should return a collection with repeated elements when multiplying with a positive number", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.multiply(2);
    expect(result).toEqual(new Collection(1, 2, 3, 1, 2, 3));
  });

  it("should return an empty collection when multiplying with a negative number", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.multiply(-1);
    expect(result).toEqual(new Collection());
  });

  it("should handle collections with duplicate elements correctly", () => {
    const collection = new Collection(1, 2, 2, 3);
    const result = collection.multiply(2);
    expect(result).toEqual(new Collection(1, 2, 2, 3, 1, 2, 2, 3));
  });

  it("should handle collections with mixed data types", () => {
    // @ts-ignore
    const collection = new Collection(1, "a", true);
    const result = collection.multiply(2);
    // @ts-ignore
    expect(result).toEqual(new Collection(1, "a", true, 1, "a", true));
  });

  it("should handle collections with arrays of objects correctly", () => {
    const collection = new Collection({ id: 1 }, { id: 2 });
    const result = collection.multiply(2);
    expect(result).toEqual(
      new Collection({ id: 1 }, { id: 2 }, { id: 1 }, { id: 2 })
    );
  });
});

import Collection from "../../src/Collection";

describe("Collection.make", () => {
  it("should create an empty collection", () => {
    const collection = Collection.make();
    expect(collection).toBeInstanceOf(Collection);
    expect(collection.length).toBe(0);
  });

  it("should create a collection with primitive values", () => {
    const collection = Collection.make(1, 2, 3, 4, 5);
    expect(collection).toBeInstanceOf(Collection);
    expect(collection.length).toBe(5);
    expect(collection).toEqual([1, 2, 3, 4, 5]);
  });

  it("should create a collection with objects", () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const collection = Collection.make(...items);
    expect(collection).toBeInstanceOf(Collection);
    expect(collection.length).toBe(3);
    expect(collection).toEqual(items);
  });

  it("should handle mixed data types", () => {
    const collection = Collection.make<
      number | string | { id: number } | number[]
    >(1, "two", { id: 3 }, [4, 5]);
    expect(collection).toBeInstanceOf(Collection);
    expect(collection.length).toBe(4);
    expect(collection).toEqual([1, "two", { id: 3 }, [4, 5]]);
  });

  it("should allow spreading an existing collection", () => {
    const original = Collection.make(1, 2, 3);
    const newCollection = Collection.make(...original);
    expect(newCollection).toBeInstanceOf(Collection);
    expect(newCollection).toEqual(original);
    expect(newCollection).not.toBe(original); // Ensure it's a new instance
  });
});

import Collection from "../../src/Collection";

describe("Collection.min", () => {
  it("should return null for an empty collection", () => {
    const collection = new Collection<number>();
    expect(collection.min()).toBeNull();
  });

  it("should return the minimum value for a collection of numbers", () => {
    const collection = new Collection(5, 3, 8, 1, 9);
    expect(collection.min()).toBe(1);
  });

  it("should return the minimum value for a collection of objects with a valid key", () => {
    const collection = new Collection(
      { age: 30 },
      { age: 25 },
      { age: 35 },
      { age: 20 }
    );
    expect(collection.min("age")).toBe(20);
  });

  it("should return 0 for objects with missing keys", () => {
    const collection = new Collection(
      { age: 30 },
      { age: 25 },
      { height: 180 },
      { age: 20 }
    );

    expect(collection.min("age")).toBe(20);
  });

  it("should handle mixed data types gracefully", () => {
    const collection = new Collection<any>(
      { value: 10 },
      { value: "string" },
      { value: 5 },
      { value: null }
    );
    expect(collection.min("value")).toBe(5);
  });

  it("should return null if the key is provided but the collection is empty", () => {
    const collection = new Collection<{ age: number }>();
    expect(collection.min("age")).toBeNull();
  });

  it("should return the minimum value for a collection of numbers when casted as unknown", () => {
    const collection = new Collection(10, 15, 3, 7);
    expect(collection.min()).toBe(3);
  });
});

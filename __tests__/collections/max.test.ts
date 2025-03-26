import Collection from "../../src/Collection";

describe("Collection.max", () => {
  it("should return the maximum value when the collection contains only numbers", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    expect(collection.max()).toBe(5);
  });

  it("should return null for an empty collection", () => {
    const collection = new Collection<number>();
    expect(collection.max()).toBeNull();
  });

  it("should return the maximum value based on the provided key", () => {
    const collection = new Collection(
      { value: 10 },
      { value: 20 },
      { value: 15 }
    );
    expect(collection.max("value")).toBe(20);
  });

  it("should return null for an empty collection with a key", () => {
    const collection = new Collection<{ value: number }>();
    expect(collection.max("value")).toBeNull();
  });

  it("should handle missing keys gracefully", () => {
    const collection = new Collection(
      { value: 10 },
      { otherKey: 20 },
      { value: 15 }
    );
    expect(collection.max("value")).toBe(15);
  });

  it("should handle mixed data types in the collection", () => {
    const collection = new Collection(
      { value: "10" },
      { value: 20 },
      { value: "15" }
    );
    expect(collection.max("value")).toBe(20);
  });

  it("should correctly calculate the maximum for negative numbers", () => {
    const collection = new Collection(-10, -20, -5, -15);
    expect(collection.max()).toBe(-5);
  });
});

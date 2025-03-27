import Collection from "../../src/Collection";

describe("Collection.median", () => {
  it("should return null for an empty collection", () => {
    const collection = new Collection<number>();
    expect(collection.median()).toBeNull();
  });

  it("should return the median for a collection of numbers with an odd length", () => {
    const collection = new Collection(3, 1, 2);
    expect(collection.median()).toBe(2);
  });

  it("should return the median for a collection of numbers with an even length", () => {
    const collection = new Collection(4, 1, 2, 3);
    expect(collection.median()).toBe(2.5);
  });

  it("should return the median for a collection of objects when a key is provided", () => {
    const collection = new Collection({ value: 3 }, { value: 1 }, { value: 2 });
    expect(collection.median("value")).toBe(2);
  });

  it("should handle missing keys gracefully when a key is provided", () => {
    const collection = new Collection(
      { value: 3 },
      { value: 1 },
      { otherKey: 2 }
    );

    expect(collection.median("value")).toBe(1); // Missing keys treated as 0
  });

  it("should return 0 if all keys are missing when a key is provided", () => {
    const collection = new Collection(
      { otherKey: 3 },
      { otherKey: 1 },
      { otherKey: 2 }
    );

    //@ts-ignore
    expect(collection.median("value")).toBe(0);
  });

  it("should handle a collection of numbers with duplicates", () => {
    const collection = new Collection(1, 2, 2, 3, 4);
    expect(collection.median()).toBe(2);
  });

  it("should handle a collection of objects with duplicates when a key is provided", () => {
    const collection = new Collection(
      { value: 1 },
      { value: 2 },
      { value: 2 },
      { value: 3 },
      { value: 4 }
    );
    expect(collection.median("value")).toBe(2);
  });
});

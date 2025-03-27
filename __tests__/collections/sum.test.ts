import Collection from "../../src/Collection";

describe("Collection.sum", () => {
  it("should return the sum of numbers in the collection", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.sum();
    expect(result).toBe(15);
  });

  it("should return the sum of numbers in the collection using a key", () => {
    const collection = new Collection(
      { value: 10 },
      { value: 20 },
      { value: 30 }
    );
    const result = collection.sum("value");
    expect(result).toBe(60);
  });

  it("should return the sum of numbers in the collection using a callback", () => {
    const collection = new Collection(
      { value: 10 },
      { value: 20 },
      { value: 30 }
    );
    const result = collection.sum((item) => item.value * 2);
    expect(result).toBe(120);
  });

  it("should return 0 for an empty collection", () => {
    const collection = new Collection();
    const result = collection.sum();
    expect(result).toBe(0);
  });

  it("should ignore non-numeric values in the collection", () => {
    // @ts-ignore
    const collection = new Collection(1, "a", 2, null, 3);
    const result = collection.sum();
    expect(result).toBe(6);
  });

  it("should ignore non-numeric values when using a key", () => {
    const collection = new Collection(
      { value: 10 },
      { value: "a" },
      { value: 20 }
    );
    const result = collection.sum("value");
    expect(result).toBe(30);
  });

  it("should handle mixed numeric and non-numeric values with a callback", () => {
    const collection = new Collection(
      { value: 10 },
      { value: "a" },
      { value: 20 }
    );
    const result = collection.sum((item) =>
      typeof item.value === "number" ? item.value : 0
    );
    expect(result).toBe(30);
  });
});

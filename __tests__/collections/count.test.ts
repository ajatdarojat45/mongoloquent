import Collection from "../../src/Collection";

describe("Collection.count", () => {
  it("should return the correct count for a non-empty collection", () => {
    const collection = new Collection(...[1, 2, 3, 4, 5]);
    const result = collection.count();
    expect(result).toBe(5);
  });

  it("should return 0 for an empty collection", () => {
    const collection = new Collection(...[]);
    const result = collection.count();
    expect(result).toBe(0);
  });

  it("should return the correct count for a collection with mixed types", () => {
    const collection = new Collection<
      number | string | { key: string } | boolean | null
    >(...[1, "two", { key: "value" }, true, null]);
    const result = collection.count();
    expect(result).toBe(5);
  });

  it("should return the updated count after adding elements", () => {
    const collection = new Collection(...[1, 2, 3]);
    collection.push(4, 5);
    const result = collection.count();
    expect(result).toBe(5);
  });

  it("should return the updated count after removing elements", () => {
    const collection = new Collection(...[1, 2, 3, 4, 5]);
    collection.pop();
    collection.pop();
    const result = collection.count();
    expect(result).toBe(3);
  });
});

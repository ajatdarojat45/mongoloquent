import Collection from "../../src/Collection";

describe("Collection.last", () => {
  it("should return null when the collection is empty", () => {
    const collection = new Collection<number>();
    const result = collection.last();
    expect(result).toBeNull();
  });

  it("should return the last item when no predicate is provided", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.last();
    expect(result).toBe(5);
  });

  it("should return the last item that matches the predicate", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.last((item) => item % 2 === 0);
    expect(result).toBe(4);
  });

  it("should return null when no items match the predicate", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.last((item) => item > 10);
    expect(result).toBeNull();
  });

  it("should return the last item when the predicate matches the last item", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.last((item) => item === 5);
    expect(result).toBe(5);
  });

  it("should return the last matching item when the predicate matches multiple items", () => {
    const collection = new Collection(1, 2, 3, 4, 5, 6, 7, 8);
    const result = collection.last((item) => item % 2 === 0);
    expect(result).toBe(8);
  });
});

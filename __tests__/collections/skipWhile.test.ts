import Collection from "../../src/Collection";

describe("Collection.skipWhile", () => {
  it("should skip items while the callback condition is true", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.skipWhile((item) => item < 3);
    expect(result).toEqual(new Collection(3, 4, 5));
  });

  it("should stop skipping when the callback condition becomes false", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.skipWhile((item) => item !== 3);
    expect(result).toEqual(new Collection(3, 4, 5));
  });

  it("should return an empty collection if the original collection is empty", () => {
    const collection = new Collection<number>();
    const result = collection.skipWhile((item) => item < 3);
    expect(result).toEqual(new Collection());
  });

  it("should return an empty collection if all items match the condition", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.skipWhile((item) => item < 10);
    expect(result).toEqual(new Collection());
  });

  it("should return the entire collection if no items match the condition", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.skipWhile((item) => item > 10);
    expect(result).toEqual(new Collection(1, 2, 3));
  });

  it("should handle complex conditions", () => {
    const collection = new Collection({ id: 1 }, { id: 2 }, { id: 3 });
    const result = collection.skipWhile((item) => item.id < 3);
    expect(result).toEqual(new Collection({ id: 3 }));
  });
});

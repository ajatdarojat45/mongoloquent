import Collection from "../../src/Collection";

describe("Collection.skipUntil", () => {
  it("should skip items until the callback condition is met", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.skipUntil((item) => item > 3);
    expect(result).toEqual(new Collection(4, 5));
  });

  it("should return the entire collection if the callback matches the first item", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.skipUntil((item) => item === 1);
    expect(result).toEqual(new Collection(1, 2, 3, 4, 5));
  });

  it("should return only the last item if the callback matches the last item", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.skipUntil((item) => item === 5);
    expect(result).toEqual(new Collection(5));
  });

  it("should return an empty collection if the callback matches no items", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.skipUntil((item) => item > 10);
    expect(result).toEqual(new Collection());
  });

  it("should return an empty collection if the collection is empty", () => {
    const collection = new Collection<number>();
    const result = collection.skipUntil((item) => item > 0);
    expect(result).toEqual(new Collection());
  });
});

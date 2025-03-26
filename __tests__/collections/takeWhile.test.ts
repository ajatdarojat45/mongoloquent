import Collection from "../../src/Collection";

describe("Collection.takeWhile", () => {
  it("should return all elements when the callback always returns true", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeWhile(() => true);
    expect(result).toEqual(new Collection(1, 2, 3, 4, 5));
  });

  it("should return no elements when the callback always returns false", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeWhile(() => false);
    expect(result).toEqual(new Collection());
  });

  it("should stop at the first element where the callback returns false", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeWhile((item) => item < 3);
    expect(result).toEqual(new Collection(1, 2));
  });

  it("should work with an empty collection", () => {
    const collection = new Collection<number>();
    const result = collection.takeWhile(() => true);
    expect(result).toEqual(new Collection());
  });

  it("should work with a collection of objects and a callback based on object properties", () => {
    const collection = new Collection(
      { id: 1, active: true },
      { id: 2, active: true },
      { id: 3, active: false },
      { id: 4, active: true }
    );
    const result = collection.takeWhile((item) => item.active);
    expect(result).toEqual(
      new Collection({ id: 1, active: true }, { id: 2, active: true })
    );
  });
});

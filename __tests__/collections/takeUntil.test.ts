import Collection from "../../src/Collection";

describe("Collection.takeUntil", () => {
  it("should return items up to the first match of the callback", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeUntil((item) => item > 3);
    expect(result).toEqual(new Collection(1, 2, 3));
  });

  it("should return the entire collection if the callback does not match any item", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeUntil((item) => item > 10);
    expect(result).toEqual(collection);
  });

  it("should return an empty collection if the original collection is empty", () => {
    const collection = new Collection<number>();
    const result = collection.takeUntil((item) => item > 3);
    expect(result).toEqual(new Collection());
  });

  it("should return an empty collection if the callback matches the first item", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeUntil((item) => item === 1);
    expect(result).toEqual(new Collection());
  });

  it("should return all items except the last one if the callback matches the last item", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeUntil((item) => item === 5);
    expect(result).toEqual(new Collection(1, 2, 3, 4));
  });

  it("should handle complex objects with a callback", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );
    const result = collection.takeUntil((item) => item.name === "Bob");
    expect(result).toEqual(new Collection({ id: 1, name: "Alice" }));
  });

  it("should return the entire collection if the callback always returns false", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeUntil(() => false);
    expect(result).toEqual(collection);
  });

  it("should return an empty collection if the callback always returns true", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const result = collection.takeUntil(() => true);
    expect(result).toEqual(new Collection());
  });
});

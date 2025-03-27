import Collection from "../../src/Collection";

describe("Collection.shuffle", () => {
  it("should return a new Collection instance", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const shuffled = collection.shuffle();
    expect(shuffled).toBeInstanceOf(Collection);
  });

  it("should shuffle the elements in the collection", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const shuffled = collection.shuffle();
    expect(shuffled).toHaveLength(collection.length);
    expect(shuffled).toEqual(expect.arrayContaining(collection));
    expect(shuffled).not.toEqual(collection); // Ensure the order is different
  });

  it("should not mutate the original collection", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const original = [...collection];
    collection.shuffle();
    expect(collection).toEqual(original);
  });

  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection();
    const shuffled = collection.shuffle();
    expect(shuffled).toBeInstanceOf(Collection);
    expect(shuffled).toHaveLength(0);
  });

  it("should return the same collection when it contains a single element", () => {
    const collection = new Collection(42);
    const shuffled = collection.shuffle();
    expect(shuffled).toEqual(collection);
  });

  it("should shuffle a collection of primitive types", () => {
    const collection = new Collection("a", "b", "c", "d", "e");
    const shuffled = collection.shuffle();
    expect(shuffled).toHaveLength(collection.length);
    expect(shuffled).toEqual(expect.arrayContaining(collection));
    expect(shuffled).not.toEqual(collection); // Ensure the order is different
  });

  it("should shuffle a collection of objects", () => {
    const collection = new Collection(
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" }
    );
    const shuffled = collection.shuffle();
    expect(shuffled).toHaveLength(collection.length);
    expect(shuffled).toEqual(expect.arrayContaining(collection));
    expect(shuffled).not.toEqual(collection); // Ensure the order is different
  });
});

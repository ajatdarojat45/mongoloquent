import Collection from "../../src/Collection";

describe("Collection.isEmpty", () => {
  it("should return true for an empty collection", () => {
    const collection = new Collection();
    expect(collection.isEmpty()).toBe(true);
  });

  it("should return false for a collection with one element", () => {
    const collection = new Collection(1);
    expect(collection.isEmpty()).toBe(false);
  });

  it("should return false for a collection with multiple elements", () => {
    const collection = new Collection(1, 2, 3);
    expect(collection.isEmpty()).toBe(false);
  });

  it("should return true for an empty collection of objects", () => {
    const collection = new Collection<object>();
    expect(collection.isEmpty()).toBe(true);
  });

  it("should return false for a collection of strings", () => {
    const collection = new Collection("a", "b", "c");
    expect(collection.isEmpty()).toBe(false);
  });

  it("should return true after clearing all elements from the collection", () => {
    const collection = new Collection(1, 2, 3);
    collection.length = 0; // Clear the collection
    expect(collection.isEmpty()).toBe(true);
  });
});

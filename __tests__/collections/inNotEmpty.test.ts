import Collection from "../../src/Collection";

describe("Collection.isNotEmpty", () => {
  it("should return false for an empty collection", () => {
    const collection = new Collection();
    expect(collection.isNotEmpty()).toBe(false);
  });

  it("should return true for a collection with one element", () => {
    const collection = new Collection(1);
    expect(collection.isNotEmpty()).toBe(true);
  });

  it("should return true for a collection with multiple elements", () => {
    const collection = new Collection(1, 2, 3);
    expect(collection.isNotEmpty()).toBe(true);
  });

  it("should return false after removing all elements from the collection", () => {
    const collection = new Collection(1, 2, 3);
    collection.length = 0; // Clear the collection
    expect(collection.isNotEmpty()).toBe(false);
  });

  it("should return true after adding elements to an empty collection", () => {
    const collection = new Collection();
    collection.push(1); // Add an element
    expect(collection.isNotEmpty()).toBe(true);
  });
});

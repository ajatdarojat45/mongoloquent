import Collection from "../../src/Collection";

describe("Collection.sortDesc", () => {
  it("should sort a collection of numbers in descending order", () => {
    const collection = new Collection(5, 3, 8, 1, 2);
    const sorted = collection.sortDesc();
    expect(sorted).toEqual(new Collection(8, 5, 3, 2, 1));
  });

  it("should sort a collection of strings in descending order", () => {
    const collection = new Collection("apple", "orange", "banana", "grape");
    const sorted = collection.sortDesc();
    expect(sorted).toEqual(
      new Collection("orange", "grape", "banana", "apple")
    );
  });

  it("should sort a collection of objects by a specific key in descending order", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 5 },
      { id: 3, value: 20 }
    );
    const sorted = collection.sortByDesc("value");
    expect(sorted).toEqual(
      new Collection(
        { id: 3, value: 20 },
        { id: 1, value: 10 },
        { id: 2, value: 5 }
      )
    );
  });

  it("should return an empty collection when sorting an empty collection", () => {
    const collection = new Collection();
    const sorted = collection.sortDesc();
    expect(sorted).toEqual(new Collection());
  });

  it("should handle a collection with duplicate values", () => {
    const collection = new Collection(4, 2, 4, 1, 3);
    const sorted = collection.sortDesc();
    expect(sorted).toEqual(new Collection(4, 4, 3, 2, 1));
  });
});

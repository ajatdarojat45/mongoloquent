import Collection from "../../src/Collection";

describe("Collection.sortByDesc", () => {
  it("should sort by a single key in descending order", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 30 },
      { id: 3, value: 20 }
    );

    const sorted = collection.sortByDesc("value");

    expect(sorted).toEqual([
      { id: 2, value: 30 },
      { id: 3, value: 20 },
      { id: 1, value: 10 },
    ]);
  });

  it("should sort using multiple keys with specified directions", () => {
    const collection = new Collection(
      { id: 1, value: 10, priority: 2 },
      { id: 2, value: 10, priority: 1 },
      { id: 3, value: 20, priority: 3 }
    );

    const sorted = collection.sortByDesc([
      ["value", "desc"],
      ["priority", "asc"],
    ]);

    expect(sorted).toEqual([
      { id: 3, value: 20, priority: 3 },
      { id: 2, value: 10, priority: 1 },
      { id: 1, value: 10, priority: 2 },
    ]);
  });

  it("should handle an empty collection", () => {
    const collection = new Collection();

    // @ts-ignore
    const sorted = collection.sortByDesc("value");

    expect(sorted).toEqual([]);
  });
});

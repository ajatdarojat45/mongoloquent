import Collection from "../../src/Collection";

describe("Collection.sortBy", () => {
  it("should sort by a single key in ascending order", () => {
    const collection = new Collection(
      { id: 3, name: "C" },
      { id: 1, name: "A" },
      { id: 2, name: "B" }
    );

    const sorted = collection.sortBy("id");
    expect(sorted).toEqual([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" },
    ]);
  });

  it("should sort by a single key in descending order", () => {
    const collection = new Collection(
      { id: 3, name: "C" },
      { id: 1, name: "A" },
      { id: 2, name: "B" }
    );

    const sorted = collection.sortBy("id", "desc");
    expect(sorted).toEqual([
      { id: 3, name: "C" },
      { id: 2, name: "B" },
      { id: 1, name: "A" },
    ]);
  });

  it("should sort using a custom callback function", () => {
    const collection = new Collection(3, 1, 2);

    const sorted = collection.sortBy((a, b) => a - b);
    expect(sorted).toEqual([1, 2, 3]);
  });

  it("should sort by multiple keys with specified directions", () => {
    const collection = new Collection(
      { id: 1, name: "B" },
      { id: 2, name: "A" },
      { id: 1, name: "A" }
    );

    const sorted = collection.sortBy([
      ["id", "asc"],
      ["name", "asc"],
    ]);
    expect(sorted).toEqual([
      { id: 1, name: "A" },
      { id: 1, name: "B" },
      { id: 2, name: "A" },
    ]);
  });

  it("should handle an empty collection", () => {
    const collection = new Collection();

    // @ts-ignore
    const sorted = collection.sortBy("id");
    expect(sorted).toEqual(new Collection());
  });
});

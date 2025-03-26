import Collection from "../../src/Collection";

describe("Collection.whereNotBetween", () => {
  it("should return items outside the range for numeric values", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 },
      { id: 4, value: 40 }
    );

    const result = collection.whereNotBetween("value", [15, 35]);

    expect(result).toEqual(
      new Collection({ id: 1, value: 10 }, { id: 4, value: 40 })
    );
  });

  it("should return an empty collection when all items are within the range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.whereNotBetween("value", [5, 35]);

    expect(result).toEqual(new Collection());
  });

  it("should return all items when all are outside the range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.whereNotBetween("value", [40, 50]);

    expect(result).toEqual(collection);
  });

  it("should handle string values correctly", () => {
    const collection = new Collection(
      { id: 1, value: "apple" },
      { id: 2, value: "banana" },
      { id: 3, value: "cherry" }
    );

    const result = collection.whereNotBetween("value", ["banana", "cherry"]);

    expect(result).toEqual(new Collection({ id: 1, value: "apple" }));
  });

  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection();

    // @ts-ignore
    const result = collection.whereNotBetween("value", [10, 20]);

    expect(result).toEqual(new Collection());
  });

  it("should include items on the boundaries of the range", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.whereNotBetween("value", [10, 30]);

    expect(result).toEqual(new Collection());
  });

  it("should exclude items outside the range when boundaries are reversed", () => {
    const collection = new Collection(
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 }
    );

    const result = collection.whereNotBetween("value", [30, 10]);
    expect(result).toEqual(
      new Collection(
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 }
      )
    );
  });
});

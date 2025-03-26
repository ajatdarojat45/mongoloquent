import Collection from "../../src/Collection";

describe("Collection.countBy", () => {
  it("should count items by their value when no argument is provided", () => {
    const collection = new Collection(...[1, 2, 2, 3, 3, 3]);
    const result = collection.countBy();
    expect(result).toEqual({ "1": 1, "2": 2, "3": 3 });
  });

  it("should count items by a specific key in the objects", () => {
    const collection = new Collection(
      ...[
        { category: "A" },
        { category: "B" },
        { category: "A" },
        { category: "C" },
        { category: "A" },
      ]
    );
    const result = collection.countBy((item) => item.category);
    expect(result).toEqual({ A: 3, B: 1, C: 1 });
  });

  it("should count items based on a callback function", () => {
    const collection = new Collection(...[1, 2, 3, 4, 5, 6]);
    const result = collection.countBy((item) =>
      item % 2 === 0 ? "even" : "odd"
    );
    expect(result).toEqual({ odd: 3, even: 3 });
  });

  it("should return an empty object when called on an empty collection", () => {
    const collection = new Collection(...[]);
    const result = collection.countBy();
    expect(result).toEqual({});
  });
});

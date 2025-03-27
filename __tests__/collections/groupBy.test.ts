import Collection from "../../src/Collection";

describe("Collection.groupBy", () => {
  it("should group items by a key", () => {
    const collection = new Collection(
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" },
      { category: "vegetable", name: "carrot" }
    );

    const grouped = collection.groupBy("category");

    expect(grouped).toBeInstanceOf(Collection);
    expect(grouped).toHaveLength(2);
    expect(grouped[0]).toHaveProperty("fruit");
    expect(grouped[0].fruit).toEqual([
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" },
    ]);
    expect(grouped[1]).toHaveProperty("vegetable");
    expect(grouped[1].vegetable).toEqual([
      { category: "vegetable", name: "carrot" },
    ]);
  });

  it("should group items by a callback function", () => {
    const collection = new Collection(
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" },
      { category: "vegetable", name: "carrot" }
    );

    const grouped = collection.groupBy((item) => item.name[0]); // Group by the first letter of the name

    expect(grouped).toBeInstanceOf(Collection);
    expect(grouped).toHaveLength(3);
    expect(grouped[0]).toHaveProperty("a");
    expect(grouped[0].a).toEqual([{ category: "fruit", name: "apple" }]);
    expect(grouped[1]).toHaveProperty("b");
    expect(grouped[1].b).toEqual([{ category: "fruit", name: "banana" }]);
    expect(grouped[2]).toHaveProperty("c");
    expect(grouped[2].c).toEqual([{ category: "vegetable", name: "carrot" }]);
  });

  it("should return an empty collection when grouping an empty collection", () => {
    const collection = new Collection();

    const grouped = collection.groupBy("category");

    expect(grouped).toBeInstanceOf(Collection);
    expect(grouped).toHaveLength(0);
  });

  it("should handle duplicate keys correctly", () => {
    const collection = new Collection(
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" },
      { category: "fruit", name: "cherry" }
    );

    const grouped = collection.groupBy("category");

    expect(grouped).toBeInstanceOf(Collection);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toHaveProperty("fruit");
    expect(grouped[0].fruit).toEqual([
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" },
      { category: "fruit", name: "cherry" },
    ]);
  });

  it("should handle non-existent keys gracefully", () => {
    const collection = new Collection(
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" }
    );

    const grouped = collection.groupBy("nonExistentKey");

    expect(grouped).toBeInstanceOf(Collection);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toHaveProperty("undefined");
    expect(grouped[0].undefined).toEqual([
      { category: "fruit", name: "apple" },
      { category: "fruit", name: "banana" },
    ]);
  });
});

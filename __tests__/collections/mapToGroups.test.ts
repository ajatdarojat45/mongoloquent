import Collection from "../../src/Collection";

describe("Collection.mapToGroups", () => {
  it("should return an empty collection when called on an empty collection", () => {
    const collection = new Collection<number>();
    const result = collection.mapToGroups(() => ({ group: "any" }));

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(0);
  });

  it("should handle complex objects as items", () => {
    const collection = new Collection(
      { id: 1, type: "A" },
      { id: 2, type: "B" },
      { id: 3, type: "A" },
      { id: 4, type: "B" }
    );
    const result = collection.mapToGroups((item) => ({
      [item.type]: item,
    }));

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual([
      { id: 1, type: "A" },
      { id: 3, type: "A" },
    ]); // Group A
    expect(result[1]).toEqual([
      { id: 2, type: "B" },
      { id: 4, type: "B" },
    ]); // Group B
  });

  it("should handle cases where the callback returns objects with multiple keys", () => {
    const collection = new Collection(1, 2, 3);
    const result = collection.mapToGroups((item) => ({
      [`key-${item}`]: item,
      extraKey: "ignored",
    }));

    expect(result).toBeInstanceOf(Collection);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual([1]); // Group for key-1
    expect(result[1]).toEqual([2]); // Group for key-2
    expect(result[2]).toEqual([3]); // Group for key-3
  });
});

import Collection from "../../src/Collection";

describe("Collection - avg method", () => {
  let collection: Collection<{ id: number; value: number }>;

  beforeEach(() => {
    collection = new Collection([
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 },
    ]);
  });

  it("should calculate the average of a numeric key", () => {
    const result = collection.avg("value");
    expect(result).toBe(20); // (10 + 20 + 30) / 3 = 20
  });

  it("should calculate the average using a callback function", () => {
    const result = collection.avg((item) => item.value * 2);
    expect(result).toBe(40); // ((10 * 2) + (20 * 2) + (30 * 2)) / 3 = 40
  });

  it("should return null for an empty collection", () => {
    const emptyCollection = new Collection([]);
    const result = emptyCollection.avg("value");
    expect(result).toBeNull();
  });

  it("should return 0 for a key that does not exist in the collection", () => {
    const result = collection.avg(
      "nonExistentKey" as keyof (typeof collection)[0]
    );
    expect(result).toBe(0); // Non-existent keys are treated as 0
  });
});

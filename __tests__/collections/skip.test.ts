import Collection from "../../src/Collection";

describe("Collection", () => {
  it("should initialize with elements", () => {
    const collection = new Collection(1, 2, 3);
    expect(collection).toBeInstanceOf(Collection);
    expect(collection).toHaveLength(3);
    expect(collection.all()).toEqual([1, 2, 3]);
  });

  it("should return the element after a given one", () => {
    const collection = new Collection({ id: 1 }, { id: 2 }, { id: 3 });
    const result = collection.after("id", 1);
    expect(result).toEqual({ id: 2 });
  });

  it("should return the element before a given one", () => {
    const collection = new Collection({ id: 1 }, { id: 2 }, { id: 3 });
    const result = collection.before("id", 2);
    expect(result).toEqual({ id: 1 });
  });

  it("should calculate the average of numeric values", () => {
    const collection = new Collection(
      { value: 10 },
      { value: 20 },
      { value: 30 }
    );
    const avg = collection.average("value");
    expect(avg).toBe(20);
  });

  it("should chunk the collection into smaller collections", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const chunks = collection.chunk(2);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual(new Collection(1, 2));
  });

  it("should concatenate two collections", () => {
    const collection1 = new Collection(1, 2);
    const collection2 = new Collection(3, 4);
    const result = collection1.concat(collection2);
    expect(result).toEqual(new Collection(1, 2, 3, 4));
  });

  it("should check if a collection contains a value", () => {
    const collection = new Collection({ id: 1 }, { id: 2 });
    expect(collection.contains("id", 1)).toBe(true);
    expect(collection.contains("id", 3)).toBe(false);
  });

  it("should count the number of elements", () => {
    const collection = new Collection(1, 2, 3);
    expect(collection.count()).toBe(3);
  });

  it("should group elements by a key", () => {
    const collection = new Collection(
      { category: "A", value: 1 },
      { category: "B", value: 2 },
      { category: "A", value: 3 }
    );
    const grouped = collection.groupBy("category");
    expect(grouped).toEqual(
      new Collection(
        {
          A: [
            { category: "A", value: 1 },
            { category: "A", value: 3 },
          ],
        },
        { B: [{ category: "B", value: 2 }] }
      )
    );
  });

  it("should return a random element", () => {
    const collection = new Collection(1, 2, 3);
    const randomElement = collection.random();
    expect(collection).toContain(randomElement);
  });

  it("should shuffle the collection", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const shuffled = collection.shuffle();
    expect(shuffled).toHaveLength(5);
    expect(shuffled).not.toEqual(collection); // Likely shuffled
  });

  it("should skip the first n elements", () => {
    const collection = new Collection(1, 2, 3, 4, 5);
    const skipped = collection.skip(2);
    expect(skipped).toEqual(new Collection(3, 4, 5));
  });

  it("should select specific keys from objects", () => {
    const collection = new Collection(
      { id: 1, name: "John" },
      { id: 2, name: "Jane" }
    );
    const selected = collection.select(["id"]);
    expect(selected).toEqual(new Collection({ id: 1 }, { id: 2 }));
  });

  it("should calculate the max value", () => {
    const collection = new Collection(
      { value: 10 },
      { value: 20 },
      { value: 30 }
    );
    const max = collection.max("value");
    expect(max).toBe(30);
  });

  it("should calculate the min value", () => {
    const collection = new Collection(
      { value: 10 },
      { value: 20 },
      { value: 30 }
    );
    const min = collection.min("value");
    expect(min).toBe(10);
  });

  it("should calculate the median value", () => {
    const collection = new Collection(
      { value: 10 },
      { value: 20 },
      { value: 30 }
    );
    const median = collection.median("value");
    expect(median).toBe(20);
  });

  it("should multiply the collection", () => {
    const collection = new Collection(1, 2);
    const multiplied = collection.multiply(3);
    expect(multiplied).toEqual(new Collection(1, 2, 1, 2, 1, 2));
  });

  it("should pluck specific keys", () => {
    const collection = new Collection(
      { id: 1, name: "John" },
      { id: 2, name: "Jane" }
    );
    const plucked = collection.pluck("name");
    expect(plucked).toEqual(new Collection("John", "Jane"));
  });

  it("should find an element by a key", () => {
    const collection = new Collection({ id: 1 }, { id: 2 });
    const found = collection.firstWhere("id", 2);
    expect(found).toEqual({ id: 2 });
  });

  it("should handle empty collections", () => {
    const collection = new Collection();
    expect(collection.isEmpty()).toBe(true);
    expect(collection.isNotEmpty()).toBe(false);
  });
});

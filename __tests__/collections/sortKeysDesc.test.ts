import Collection from "../../src/Collection";

describe("Collection.sortKeysDesc", () => {
  it("should sort object keys in descending order", () => {
    const collection = new Collection({ b: 2, a: 1, c: 3 });
    const sorted = collection.sortKeysDesc();
    expect(sorted).toEqual(new Collection({ c: 3, b: 2, a: 1 }));
  });

  it("should handle an empty collection", () => {
    const collection = new Collection();
    const sorted = collection.sortKeysDesc();
    expect(sorted).toEqual(new Collection());
  });

  it("should only sort top-level keys for nested objects", () => {
    const collection = new Collection({
      b: { nested: 2 },
      a: { nested: 1 },
      c: { nested: 3 },
    });
    const sorted = collection.sortKeysDesc();
    expect(sorted).toEqual(
      new Collection({
        c: { nested: 3 },
        b: { nested: 2 },
        a: { nested: 1 },
      })
    );
  });
});

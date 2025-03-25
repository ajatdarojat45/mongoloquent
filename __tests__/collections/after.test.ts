import Collection from "../../src/Collection";

describe("Collection - after method", () => {
  let collection: Collection<{ id: number; name: string }>;

  beforeEach(() => {
    collection = new Collection([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
      { id: 4, name: "David" },
    ]);
  });

  it("should return the item after the matching key with strict comparison", () => {
    const result = collection.after("id", 2);
    expect(result).toEqual({ id: 3, name: "Charlie" });
  });

  it("should return the item after the matching key with loose comparison", () => {
    const result = collection.after("id", "2", false);
    expect(result).toEqual({ id: 3, name: "Charlie" });
  });

  it("should return the item after the matching callback function", () => {
    const result = collection.after((item) => item.name === "Bob");
    expect(result).toEqual({ id: 3, name: "Charlie" });
  });

  it("should return null if no matching item is found", () => {
    const result = collection.after("id", 99);
    expect(result).toBeNull();
  });

  it("should return null if the matching item is the last in the collection", () => {
    const result = collection.after("id", 4);
    expect(result).toBeNull();
  });
});

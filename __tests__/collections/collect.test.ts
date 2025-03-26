import Collection from "../../src/Collection";

describe("Collection.collect", () => {
  it("should return a new Collection instance with the same elements (non-empty collection)", () => {
    const original = new Collection([1, 2, 3]);
    const collected = original.collect();

    expect(collected).toBeInstanceOf(Collection);
    expect(collected).toEqual(original);
    expect(collected).not.toBe(original); // Ensure it's a new instance
  });

  it("should return a new empty Collection instance when called on an empty collection", () => {
    const original = new Collection([]);
    const collected = original.collect();

    expect(collected).toBeInstanceOf(Collection);
    expect(collected).toEqual(original);
    expect(collected).not.toBe(original); // Ensure it's a new instance
  });

  it("should ensure the new Collection instance is independent of the original", () => {
    const original = new Collection(...[1, 2, 3]);
    const collected = original.collect();

    collected.push(4);

    expect(original).toEqual(new Collection(...[1, 2, 3])); // Original remains unchanged
    expect(collected).toEqual(new Collection(...[1, 2, 3, 4])); // Collected is modified
  });
});

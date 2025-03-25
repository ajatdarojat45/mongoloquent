import Collection from "../../src/Collection";

describe("Collection.concat", () => {
  it("should concatenate with another Collection instance", () => {
    const collection1 = new Collection(...[1, 2, 3]);
    const collection2 = new Collection(...[4, 5, 6]);

    const result = collection1.concat(collection2);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toEqual(new Collection(...[1, 2, 3, 4, 5, 6]));
    expect(collection1).toEqual(new Collection(...[1, 2, 3])); // Ensure original remains unchanged
    expect(collection2).toEqual(new Collection(...[4, 5, 6])); // Ensure original remains unchanged
  });

  it("should concatenate with a plain array", () => {
    const collection = new Collection(...[1, 2, 3]);
    const array = [4, 5, 6];

    const result = collection.concat(array);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toEqual(new Collection(...[1, 2, 3, 4, 5, 6]));
    expect(collection).toEqual(new Collection(...[1, 2, 3])); // Ensure original remains unchanged
  });

  it("should concatenate with an empty Collection", () => {
    const collection = new Collection(...[1, 2, 3]);
    const emptyCollection = new Collection<number>(...[]);

    const result = collection.concat(emptyCollection);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toEqual(new Collection(...[1, 2, 3]));
    expect(collection).toEqual(new Collection(...[1, 2, 3])); // Ensure original remains unchanged
  });

  it("should concatenate with an empty array", () => {
    const collection = new Collection(...[1, 2, 3]);
    const emptyArray: number[] = [];

    const result = collection.concat(emptyArray);

    expect(result).toBeInstanceOf(Collection);
    expect(result).toEqual(new Collection(...[1, 2, 3]));
    expect(collection).toEqual(new Collection(...[1, 2, 3])); // Ensure original remains unchanged
  });
});

import Collection from "../../src/Collection";

describe("Collection.each", () => {
  it("should execute the callback for each item in the collection", () => {
    const collection = new Collection(...[1, 2, 3]);
    const callback = jest.fn();

    collection.each(callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 1, 0, collection);
    expect(callback).toHaveBeenNthCalledWith(2, 2, 1, collection);
    expect(callback).toHaveBeenNthCalledWith(3, 3, 2, collection);
  });

  it("should stop iteration when the callback returns false", () => {
    const collection = new Collection(...[1, 2, 3]);
    const callback = jest.fn((item) => item !== 2);

    collection.each(callback);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, 1, 0, collection);
    expect(callback).toHaveBeenNthCalledWith(2, 2, 1, collection);
  });

  it("should return the original collection", () => {
    const collection = new Collection(...[1, 2, 3]);
    const result = collection.each(() => {});

    expect(result).toBe(collection);
  });

  it("should handle an empty collection without errors", () => {
    const collection = new Collection<number>(...[]);
    const callback = jest.fn();

    collection.each(callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it("should allow the callback to modify collection items", () => {
    const collection = new Collection(...[1, 2, 3]);

    collection.each((item, index) => {
      collection[index] = item * 2;
    });

    expect(collection).toEqual(new Collection(...[2, 4, 6]));
  });
});

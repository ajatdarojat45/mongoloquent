import Collection from "../../src/Collection";
import { MongoloquentInvalidArgumentException } from "../../src/exceptions/MongoloquentException";

describe("Collection.random", () => {
  let collection: Collection<number>;

  beforeEach(() => {
    collection = new Collection(1, 2, 3, 4, 5);
  });

  it("should return a single random item when no arguments are provided", () => {
    const randomItem = collection.random();
    expect(randomItem).toBeDefined();
    expect(collection).toContain(randomItem);
  });

  it("should return a collection of random items when a valid count is provided", () => {
    const randomItems = collection.random(3);
    console.log(randomItems);
    expect(randomItems).toBeInstanceOf(Collection);
    expect(randomItems).toHaveLength(3);
  });

  it("should throw an error when count is less than 1", () => {
    expect(() => collection.random(0)).toThrow(
      MongoloquentInvalidArgumentException
    );
  });

  it("should throw an error when count is greater than the collection size", () => {
    expect(() => collection.random(10)).toThrow(
      MongoloquentInvalidArgumentException
    );
  });

  it("should execute the callback function and return its result", () => {
    const callback = jest.fn((col) => col.count());
    const result = collection.random(callback);
    expect(callback).toHaveBeenCalledWith(collection);
    expect(result).toBe(collection.count());
  });

  it("should return undefined when called on an empty collection", () => {
    const emptyCollection = new Collection();
    const randomItem = emptyCollection.random();
    expect(randomItem).toBeUndefined();
  });
});

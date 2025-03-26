import Collection from "../../src/Collection";

describe("Collection.dump", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.log
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  it("should log the collection content to the console", () => {
    const collection = new Collection(...[1, 2, 3]);
    collection.dump();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(collection);
  });

  it("should return the collection itself for method chaining", () => {
    const collection = new Collection(...[1, 2, 3]);
    const result = collection.dump();

    expect(result).toBe(collection);
  });

  it("should work with an empty collection", () => {
    const collection = new Collection(...[]);
    collection.dump();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(collection);
  });

  it("should work with a collection of objects", () => {
    const collection = new Collection(...[{ id: 1 }, { id: 2 }]);
    collection.dump();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(collection);
  });
});

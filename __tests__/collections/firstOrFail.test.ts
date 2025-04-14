import { MongoloquentItemNotFoundException } from "../../src/exceptions/MongoloquentException";
import { collect } from "../../src/index";

describe("Collection.firstOrFail", () => {
  it("should throw MongoloquentItemNotFoundException when the collection is empty", () => {
    const collection = collect([]);
    expect(() => collection.firstOrFail()).toThrow(
      MongoloquentItemNotFoundException,
    );
  });

  it("should return the first element when no predicate is provided", () => {
    const collection = collect([1, 2, 3]);
    const result = collection.firstOrFail();
    expect(result).toBe(1);
  });

  it("should return the first element matching the predicate", () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const result = collection.firstOrFail((item) => item.id === 2);
    expect(result).toEqual({ id: 2 });
  });

  it("should throw MongoloquentItemNotFoundException when no element matches the predicate", () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(() => collection.firstOrFail((item) => item.id === 4)).toThrow(
      MongoloquentItemNotFoundException,
    );
  });
});

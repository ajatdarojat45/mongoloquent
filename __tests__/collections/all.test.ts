import { collect } from "../../src";

describe("all method", () => {
  it("should return all items", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const result = collection.all();
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it("with object", () => {
    const collection = collect([{ foo: 1 }, { foo: 2 }, { foo: 3 }]);

    const result = collection.all();
    expect(result).toEqual([{ foo: 1 }, { foo: 2 }, { foo: 3 }]);
  });
});

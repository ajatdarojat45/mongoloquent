import { collect } from "../../src/index";

describe("count", () => {
  it("with array of numbers", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const count = collection.count();

    expect(count).toEqual(5);
  });

  it("with array of objects", () => {
    const collection = collect([
      { foo: 1 },
      { foo: 2 },
      { foo: 3 },
      { foo: 4 },
      { foo: 5 },
    ]);

    const count = collection.count();

    expect(count).toEqual(5);
  });

  it("with empty array", () => {
    const collection = collect([]);

    const count = collection.count();

    expect(count).toEqual(0);
  });
});

import { collect } from "../../src/index";

describe("contains", () => {
  it("with array of numbers", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const contains = collection.contains((item) => {
      return item > 5;
    });

    expect(contains).toEqual(false);
  });

  it("with array of objects", () => {
    const collection = collect([
      { foo: 1 },
      { foo: 2 },
      { foo: 3 },
      { foo: 4 },
      { foo: 5 },
    ]);

    const contains = collection.contains((item) => {
      return item.foo > 5;
    });

    expect(contains).toEqual(false);
  });
});

import { collect } from "../../src/index";

describe("concat", () => {
  it("with array of strings", () => {
    const collection = collect(["Jhon Doe"]);

    const concatenated = collection.concat(["Jane Doe"]);
    const result = concatenated.all();

    expect(result).toEqual(["Jhon Doe", "Jane Doe"]);
  });

  it("with array of numbers", () => {
    const collection = collect([1, 2, 3]);

    const concatenated = collection.concat([4, 5, 6]);
    const result = concatenated.all();

    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("with array of objects", () => {
    const collection = collect([{ foo: 1 }, { foo: 2 }]);

    const concatenated = collection.concat([{ foo: 3 }, { foo: 4 }]);
    const result = concatenated.all();

    expect(result).toEqual([{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }]);
  });
});

import { collect } from "../../src";

describe("sliding", () => {
  it("with one parameter", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const result = collection.sliding(2);

    expect(result.all()).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ]);
  });

  it("with two parameters", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const result = collection.sliding(3, 2);

    expect(result.all()).toEqual([
      [1, 2, 3],
      [3, 4, 5],
    ]);
  });
});

import { collect } from "../../src";

describe("splitIn", () => {
  it("splitIn", () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const split = collection.splitIn(3);

    const result = split.all();

    expect(result.length).toBe(3);
  });
});

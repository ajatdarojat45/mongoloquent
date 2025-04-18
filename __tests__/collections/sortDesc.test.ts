import { collect } from "../../src";

describe("sortDesc", () => {
  it("sort desc", () => {
    const collection = collect([1, 2, 3, 4]);

    const sorted = collection.sortDesc();

    expect(sorted.all()).toEqual([4, 3, 2, 1]);
  });
});

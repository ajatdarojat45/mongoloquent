import { collect } from "../../src/index";

describe("Collection - after method", () => {
  it("should return after doc", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const result = collection.after(3);
    expect(result).toEqual([4]);
  });
});

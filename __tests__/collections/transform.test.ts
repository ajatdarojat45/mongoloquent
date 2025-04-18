import { collect } from "../../src";

describe("transform", () => {
  it("with callback", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const transformed = collection.transform((item: any) => item * 2);

    expect(transformed.all()).toEqual([2, 4, 6, 8, 10]);
  });
});

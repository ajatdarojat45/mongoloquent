import { collect } from "../../src";

describe("takeWhile", () => {
  it("with callback", () => {
    const collection = collect([1, 2, 3, 4]);

    const taken = collection.takeWhile((item: any) => item < 3);

    expect(taken.all()).toEqual([1, 2]);
  });

  it("with value", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const taken = collection.takeWhile(3);

    expect(taken.all()).toEqual([1, 2]);
  });

  it("with value not found", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const taken = collection.takeWhile(6);

    expect(taken.all()).toEqual([1, 2, 3, 4, 5]);
  });
});

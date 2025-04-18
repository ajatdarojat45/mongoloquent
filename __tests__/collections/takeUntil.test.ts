import { collect } from "../../src";

describe("takeUntil", () => {
  it("with callback", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const taken = collection.takeUntil((item: any) => item >= 3);

    expect(taken.all()).toEqual([1, 2]);
  });

  it("with value", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const taken = collection.takeUntil(3);

    expect(taken.all()).toEqual([1, 2]);
  });

  it("with value not found", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const taken = collection.takeUntil(6);

    expect(taken.all()).toEqual([1, 2, 3, 4, 5]);
  });
});

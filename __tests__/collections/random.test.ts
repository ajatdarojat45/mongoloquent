import { collect } from "../../src";

describe("random", () => {
  it("without param", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const randomValue = collection.random();

    expect(randomValue).toBeDefined();
  });

  it("with param", () => {
    const collection = collect([1, 2, 3, 4, 5]);

    const randomValue: any = collection.random(3);

    expect(randomValue).toBeDefined();
    expect(randomValue?.length).toBe(3);
  });
});

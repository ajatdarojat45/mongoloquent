import { collect } from "../../src/index";

describe("Collection - after method", () => {
  it("should return after doc", () => {
    const collection = collect<number>([1, 2, 3, 4, 5]);

    const result = collection.after(3);
    expect(result).toEqual(4);
  });

  it("with stric param", () => {
    const collection = collect<number>([1, 2, 3, 4, 5]);

    const result = collection.after("4", true);
    expect(result).toEqual(null);
  });

  it("should return null", () => {
    const collection = collect<number>([1, 2, 3, 4, 5]);

    const result = collection.after(5);
    expect(result).toEqual(null);
  });

  it("With callback", () => {
    const collection = collect<number>([2, 4, 6, 8]);

    const result = collection.after((value: number) => value > 5);
    expect(result).toEqual(8);
  });

  it("with object", () => {
    const collection = collect<{ foo: number }>([
      { foo: 1 },
      { foo: 2 },
      { foo: 3 },
      { foo: 4 },
      { foo: 5 },
    ]);

    const result = collection.after("foo", 3);
    expect(result).toEqual({ foo: 4 });
  });
});

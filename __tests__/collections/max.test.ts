import { collect } from "../../src";

describe("max", () => {
  it("with numbers", () => {
    const max = collect([1, 2, 3, 4, 5]).max();

    expect(max).toBe(5);
  });

  it("with objects", () => {
    const max = collect([{ foo: 10 }, { foo: 20 }]).max("foo");

    expect(max).toBe(20);
  });
});

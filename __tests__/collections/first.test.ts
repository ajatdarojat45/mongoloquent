import { collect } from "../../src/index";

describe("first method", () => {
  it("wihtout param", () => {
    const result = collect([1, 2, 3, 4]).first();
    expect(result).toBe(1);
  });

  it("with closure", () => {
    const result = collect([1, 2, 3, 4]).first((item) => item > 2);
    expect(result).toBe(3);
  });

  it("with closure array of objects", () => {
    const result = collect([
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
      { id: 3, name: "Jack" },
    ]).first((item) => item.id > 1);
    expect(result).toEqual({ id: 2, name: "Jane" });
  });
});

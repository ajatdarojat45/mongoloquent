import { collect } from "../../src/";

describe("skip", () => {
  it("with array of numbers", () => {
    const result = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).skip(4).all();
    expect(result).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it("with array of object", () => {
    const result = collect([
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
      { name: "Doe", age: 40 },
      { name: "Smith", age: 35 },
    ])
      .skip(2)
      .all();
    expect(result).toEqual([
      { name: "Doe", age: 40 },
      { name: "Smith", age: 35 },
    ]);
  });
});

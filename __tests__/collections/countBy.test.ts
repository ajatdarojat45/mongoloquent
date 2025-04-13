import { collect } from "../../src/index";

describe("countBy", () => {
  it("array of numbers", () => {
    const collection = collect([1, 2, 2, 3]);

    const counted = collection.countBy();

    const result = counted.all();

    expect(result).toEqual([
      {
        1: 1,
        2: 2,
        3: 1,
      },
    ]);
  });

  it("array of strings", () => {
    const collection = collect([
      "alice@gmail.com",
      "bob@yahoo.com",
      "carlos@gmail.com",
    ]);

    const counted = collection.countBy((item) => {
      return item.split("@")[1];
    });

    const result = counted.all();

    expect(result).toEqual([
      {
        "gmail.com": 2,
        "yahoo.com": 1,
      },
    ]);
  });
});

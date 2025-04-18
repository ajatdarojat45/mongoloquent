import { collect } from "../../src";

describe("sortByDesc", () => {
  it("should sort by a given key", () => {
    const collection = collect([
      { name: "Desk", price: 200 },
      { name: "Chair", price: 100 },
      { name: "Bookcase", price: 150 },
    ]);

    const sorted = collection.sortByDesc("price");

    expect(sorted.all()).toEqual([
      { name: "Desk", price: 200 },
      { name: "Bookcase", price: 150 },
      { name: "Chair", price: 100 },
    ]);
  });

  it("with two params", () => {
    const collection = collect([
      { title: "Item 1" },
      { title: "Item 12" },
      { title: "Item 3" },
    ]);

    const sorted = collection.sortByDesc("title");

    expect(sorted.all()).toEqual([
      { title: "Item 3" },
      { title: "Item 12" },
      { title: "Item 1" },
    ]);
  });

  it("with a callback", () => {
    const collection = collect([
      { name: "Desk", colors: ["Black", "Mahogany"] },
      { name: "Chair", colors: ["Black"] },
      { name: "Bookcase", colors: ["Red", "Beige", "Brown"] },
    ]);

    const sorted = collection.sortByDesc((item: any) => item.colors.length);

    expect(sorted.all()).toEqual([
      { name: "Bookcase", colors: ["Red", "Beige", "Brown"] },
      { name: "Desk", colors: ["Black", "Mahogany"] },
      { name: "Chair", colors: ["Black"] },
    ]);
  });
});

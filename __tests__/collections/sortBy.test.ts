import { collect } from "../../src";

describe("sortBy", () => {
  it("should sort by a given key", () => {
    const collection = collect([
      { name: "Desk", price: 200 },
      { name: "Chair", price: 100 },
      { name: "Bookcase", price: 150 },
    ]);

    const sorted = collection.sortBy("price");

    expect(sorted.all()).toEqual([
      { name: "Chair", price: 100 },
      { name: "Bookcase", price: 150 },
      { name: "Desk", price: 200 },
    ]);
  });

  it("with two params", () => {
    const collection = collect([
      { title: "Item 1" },
      { title: "Item 12" },
      { title: "Item 3" },
    ]);

    const sorted = collection.sortBy("title", "asc");

    expect(sorted.all()).toEqual([
      { title: "Item 1" },
      { title: "Item 12" },
      { title: "Item 3" },
    ]);
  });

  it("with a callback", () => {
    const collection = collect([
      { name: "Desk", colors: ["Black", "Mahogany"] },
      { name: "Chair", colors: ["Black"] },
      { name: "Bookcase", colors: ["Red", "Beige", "Brown"] },
    ]);

    const sorted = collection.sortBy((item: any) => item.colors.length);

    expect(sorted.all()).toEqual([
      { name: "Chair", colors: ["Black"] },
      { name: "Desk", colors: ["Black", "Mahogany"] },
      { name: "Bookcase", colors: ["Red", "Beige", "Brown"] },
    ]);
  });
});

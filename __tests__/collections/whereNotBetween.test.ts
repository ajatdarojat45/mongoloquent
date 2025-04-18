import { collect } from "../../src";

describe("weereNotBetween", () => {
  it("whereNotBetween", () => {
    const collection = collect([
      { product: "Desk", price: 200 },
      { product: "Chair", price: 80 },
      { product: "Bookcase", price: 150 },
      { product: "Pencil", price: 30 },
      { product: "Door", price: 100 },
    ]);

    const filtered = collection.whereNotBetween("price", [100, 200]);

    const result = filtered.all();
    expect(result).toEqual([
      { product: "Chair", price: 80 },
      { product: "Pencil", price: 30 },
    ]);
  });
});

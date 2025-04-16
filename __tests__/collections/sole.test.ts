import { collect } from "../../src";

describe("sole", () => {
  it("with callback", () => {
    const collection = collect([1, 2, 3, 4]).sole((item) => {
      return item === 2;
    });

    expect(collection).toEqual(2);
  });

  it("with parameter", () => {
    const collection = collect([
      { product: "Desk", price: 200 },
      { product: "Chair", price: 100 },
    ]);

    const result = collection.sole("product", "Chair");

    expect(result).toEqual({ product: "Chair", price: 100 });
  });
});

import { collect } from "../../src/index";

describe("except", () => {
  it("with array of object", () => {
    const collection = collect([{ productId: 1, price: 100, discount: false }]);

    const result = collection.except(["price", "discount"]);

    expect(result.all()).toEqual([{ productId: 1 }]);
  });
});

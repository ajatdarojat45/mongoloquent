import { collect } from "../../src";

describe("keyBy", () => {
  it("with single key", () => {
    const collection = collect([
      { productId: "prod-100", product: "Desk" },
      { productId: "prod-200", product: "Chair" },
    ]);

    const result = collection.keyBy("productId");

    expect(result).toEqual({
      "prod-100": {
        productId: "prod-100",
        product: "Desk",
      },

      "prod-200": {
        productId: "prod-200",
        product: "Chair",
      },
    });
  });

  it("with callback", () => {
    const collection = collect([
      { productId: "prod-100", product: "Desk" },
      { productId: "prod-200", product: "Chair" },
    ]);

    const result = collection.keyBy((item) => {
      return item.productId.toUpperCase();
    });

    expect(result).toEqual({
      "PROD-100": {
        productId: "prod-100",
        product: "Desk",
      },
      "PROD-200": {
        productId: "prod-200",
        product: "Chair",
      },
    });
  });
});

import { collect } from "../../src";

describe("keyBy", () => {
  it("with single key", () => {
    const collection = collect([
      { productId: "prod-100", product: "Desk" },
      { productId: "prod-200", product: "Chair" },
    ]);

    const result = collection.keyBy("productId").all();

    expect(result).toEqual([
      {
        "prod-100": {
          productId: "prod-100",
          product: "Desk",
        },
      },
      {
        "prod-200": {
          productId: "prod-200",
          product: "Chair",
        },
      },
    ]);
  });
});

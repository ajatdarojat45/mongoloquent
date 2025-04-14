import { collect } from "../../src";

describe("implode", () => {
  it("with array of objects", () => {
    const collection = collect([
      { accountId: 1, product: "Desk" },
      { accountId: 2, product: "Chair" },
    ]);

    const result = collection.implode("product", ", ");

    expect(result).toEqual("Desk, Chair");
  });

  it("with closure", () => {
    const collection = collect([
      { accountId: 1, product: "Desk" },
      { accountId: 2, product: "Chair" },
    ]);

    const result = collection.implode(
      (item) => item.product.toUpperCase(),
      ", ",
    );

    expect(result).toEqual("DESK, CHAIR");
  });

  it("with array of numbers", () => {
    const collection = collect([1, 2, 3, 4, 5]).implode("-");

    expect(collection).toEqual("1-2-3-4-5");
  });
});

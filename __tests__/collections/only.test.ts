import { collect } from "../../src";

describe("only", () => {
  it("with objects", () => {
    const collecttion = collect([
      {
        productId: 1,
        name: "Desk",
        price: 100,
        discount: false,
      },
    ]).only(["productId", "name"]);

    const filtered = collecttion.all();

    expect(filtered).toEqual([
      {
        productId: 1,
        name: "Desk",
      },
    ]);
  });
});

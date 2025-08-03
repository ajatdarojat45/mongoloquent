import { collect } from "../../src";

describe("hasAny", () => {
	it("with single key", () => {
		const collection = collect([{ accountId: 1, product: "Desk", amount: 5 }]);

		const result = collection.hasAny("product");
		expect(result).toEqual(true);
	});

	it("with multiple keys", () => {
		const collection = collect([{ accountId: 1, product: "Desk", amount: 5 }]);

		const result = collection.hasAny(["product", "amount"]);
		expect(result).toEqual(true);
	});

	it("with multiple keys", () => {
		const collection = collect([{ accountId: 1, product: "Desk", amount: 5 }]);

		const result = collection.hasAny(["amount", "price"]);
		expect(result).toEqual(true);
	});
});

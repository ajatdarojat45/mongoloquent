import { collect } from "../../src";

describe("has", () => {
	it("with single key", () => {
		const collection = collect([{ accountId: 1, product: "Desk", amount: 5 }]);

		const result = collection.has("product");
		expect(result).toEqual(true);
	});

	it("with multiple keys", () => {
		const collection = collect([{ accountId: 1, product: "Desk", amount: 5 }]);

		const result = collection.has(["product", "amount"]);
		expect(result).toEqual(true);
	});

	it("with multiple keys", () => {
		const collection = collect([{ accountId: 1, product: "Desk", amount: 5 }]);

		const result = collection.has(["amount", "price"]);
		expect(result).toEqual(false);
	});
});

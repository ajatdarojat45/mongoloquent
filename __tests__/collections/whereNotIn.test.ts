const { collect } = require("../../src");

describe("whereNotIn", () => {
	it("whreeNotIn", () => {
		const collection = collect([
			{ product: "Desk", price: 200 },
			{ product: "Chair", price: 100 },
			{ product: "Bookcase", price: 150 },
			{ product: "Door", price: 100 },
		]);

		const filtered = collection.whereNotIn("price", [150, 200]);

		const result = filtered.all();
		expect(result).toEqual([
			{ product: "Chair", price: 100 },
			{ product: "Door", price: 100 },
		]);
	});
});

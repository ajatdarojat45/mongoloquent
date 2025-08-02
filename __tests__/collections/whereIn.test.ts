import { collect } from "../../src";

describe("whereIn", () => {
	it("whereIn", () => {
		const collection = collect([
			{ product: "Desk", price: 200 },
			{ product: "Chair", price: 100 },
			{ product: "Bookcase", price: 150 },
			{ product: "Door", price: 100 },
		]);

		const filtered = collection.whereIn("price", [150, 200]);

		const result = filtered.all();

		expect(result).toEqual([
			{ product: "Desk", price: 200 },
			{ product: "Bookcase", price: 150 },
		]);
	});
});

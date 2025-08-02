import { collect } from "../../src";

describe("where", () => {
	it("without operator", () => {
		const collection = collect([
			{ product: "Desk", price: 200 },
			{ product: "Chair", price: 100 },
			{ product: "Bookcase", price: 150 },
			{ product: "Door", price: 100 },
		]);

		const filtered = collection.where("price", 100);

		const result = filtered.all();

		expect(result).toEqual([
			{ product: "Chair", price: 100 },
			{ product: "Door", price: 100 },
		]);
	});

	it("with operator", () => {
		const collection = collect([
			{ name: "Jim", deleted_at: "2019-01-01 00:00:00" },
			{ name: "Saly", deleted_at: "2019-01-02 00:00:00" },
			{ name: "Sue", deleted_at: null },
		]);

		const filtered = collection.where("deleted_at", "!=", null);

		const result = filtered.all();
		expect(result).toEqual([
			{ name: "Jim", deleted_at: "2019-01-01 00:00:00" },
			{ name: "Saly", deleted_at: "2019-01-02 00:00:00" },
		]);
	});
});

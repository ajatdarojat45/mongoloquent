import { collect } from "../../src";

describe("whereNull", () => {
	it("whereNull", () => {
		const collection = collect([
			{ name: "Desk" },
			{ name: null },
			{ name: "Bookcase" },
		]);

		const filtered = collection.whereNull("name");

		filtered.all();
		const result = filtered.all();
		expect(result).toEqual([{ name: null }]);
	});
});

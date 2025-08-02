import { collect } from "../../src";

describe("whereNotNull", () => {
	it("whereNotNull", () => {
		const collection = collect([
			{ name: "Desk" },
			{ name: null },
			{ name: "Bookcase" },
		]);

		const filtered = collection.whereNotNull("name");

		const result = filtered.all();

		expect(result).toEqual([{ name: "Desk" }, { name: "Bookcase" }]);
	});
});

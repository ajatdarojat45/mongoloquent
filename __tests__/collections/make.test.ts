import { collect } from "../../src";

describe("make", () => {
	it("with array", () => {
		const collection = collect([1, 2, 3, 4]);

		expect(collection.all()).toEqual([1, 2, 3, 4]);
	});

	it("with empty array", () => {
		const collection = collect([]);

		expect(collection.all()).toEqual([]);
	});
});

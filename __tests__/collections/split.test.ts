import { collect } from "../../src";

describe("split", () => {
	it("split", () => {
		const collection = collect([1, 2, 3, 4, 5]);

		const split = collection.split(3);

		const result = split.all();

		expect(result).toEqual([[1, 2], [3, 4], [5]]);
	});
});

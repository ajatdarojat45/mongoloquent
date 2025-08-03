import { collect } from "../../src/index";

describe("collect", () => {
	it("collect method", () => {
		const collectionA = collect([1, 2, 3]);

		const collectionB = collectionA.collect();

		const result = collectionB.all();

		expect(result).toEqual([1, 2, 3]);
	});
});

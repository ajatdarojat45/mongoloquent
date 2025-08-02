import { collect } from "../../src/index";

describe("all", () => {
	it("array of number", () => {
		const all = collect([1, 1, 2, 4]).all();

		expect(all).toEqual([1, 1, 2, 4]);
	});

	it("with array of object", () => {
		const all = collect([
			{ foo: 10 },
			{ foo: 10 },
			{ foo: 20 },
			{ foo: 40 },
		]).all();

		expect(all).toEqual([{ foo: 10 }, { foo: 10 }, { foo: 20 }, { foo: 40 }]);
	});
});

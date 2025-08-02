import { collect } from "../../src/index";

describe("before", () => {
	it("array of number", () => {
		const before = collect([1, 2, 3, 4, 5]).before(3);

		expect(before).toEqual(2);
	});

	it("should return null", () => {
		const before = collect([1, 2, 3, 4, 5]).before(1);

		expect(before).toEqual(null);
	});

	it("with strict true", () => {
		const before = collect([2, 4, 6, 8]).before("4", true);

		expect(before).toEqual(null);
	});

	it("with array of object", () => {
		const before = collect([
			{ foo: 1 },
			{ foo: 2 },
			{ foo: 3 },
			{ foo: 4 },
		]).before("foo", 3);

		expect(before).toEqual({ foo: 2 });
	});

	it("with callback", () => {
		const before = collect([2, 4, 6, 8]).before((item: any) => item > 5);

		expect(before).toEqual(4);
	});
});

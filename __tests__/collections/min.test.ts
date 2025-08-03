import { collect } from "../../src";

describe("min", () => {
	it("with numbers", () => {
		const min = collect([1, 2, 3, 4, 5]).min();

		expect(min).toBe(1);
	});

	it("with objects", () => {
		const min = collect([{ foo: 10 }, { foo: 20 }]).min("foo");

		expect(min).toBe(10);
	});
});

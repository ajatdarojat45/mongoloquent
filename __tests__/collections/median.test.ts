import { collect } from "../../src";

describe("median", () => {
	it("with numbers", () => {
		const median = collect([1, 1, 2, 4]).median();

		expect(median).toBe(1.5);
	});

	it("with objects", () => {
		const median = collect([
			{ foo: 10 },
			{ foo: 10 },
			{ foo: 20 },
			{ foo: 40 },
		]).median("foo");

		expect(median).toBe(15);
	});
});

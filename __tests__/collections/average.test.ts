import { collect } from "../../src/index";

describe("average", () => {
	it("array of number", () => {
		const avg = collect([1, 1, 2, 4]).average();

		expect(avg).toBe(2);
	});

	it("with array of object", () => {
		const avg = collect([
			{ foo: 10 },
			{ foo: 10 },
			{ foo: 20 },
			{ foo: 40 },
		]).average("foo");

		expect(avg).toBe(20);
	});
});

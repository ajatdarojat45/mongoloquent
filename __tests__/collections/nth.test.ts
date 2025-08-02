import { collect } from "../../src";

describe("nth", () => {
	it("with strings one param", () => {
		const nth = collect(["a", "b", "c", "d", "e", "f"]).nth(4);

		expect(nth).toEqual(["a", "e"]);
	});

	it("with strings two param", () => {
		const nth = collect(["a", "b", "c", "d", "e", "f"]).nth(4, 1);

		expect(nth).toEqual(["b", "f"]);
	});
});

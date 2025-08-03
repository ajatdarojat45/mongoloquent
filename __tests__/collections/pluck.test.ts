import { collect } from "../../src";

describe("pluck", () => {
	it("one key", () => {
		const collection = collect([
			{ productId: 1, name: "Desk" },
			{ productId: 2, name: "Chair" },
		]).pluck("name");

		const plucked = collection.all();

		expect(plucked).toEqual(["Desk", "Chair"]);
	});

	it("multiple keys", () => {
		const collection = collect([
			{ productId: 1, name: "Desk" },
			{ productId: 2, name: "Chair" },
		]).pluck("productId", "name");

		const plucked = collection.all();

		expect(plucked).toEqual([
			{ productId: 1, name: "Desk" },
			{ productId: 2, name: "Chair" },
		]);
	});
});

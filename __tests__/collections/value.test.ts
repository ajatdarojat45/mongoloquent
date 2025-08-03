import { collect } from "../../src";

describe("value", () => {
	it("value", () => {
		const collection = collect([
			{ product: "Desk", price: 200 },
			{ product: "Speaker", price: 400 },
		]);

		const value = collection.value("price");
		expect(value).toEqual(200);
	});
});

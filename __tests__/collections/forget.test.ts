import { collect } from "../../src/index";

describe("forget", () => {
	it("single key", () => {
		const collection = collect([{ name: "Ajat", framework: "Mongoloquent" }]);

		const result = collection.forget("framework");

		expect(result.all()).toEqual([{ name: "Ajat" }]);
	});

	it("multiple keys", () => {
		const collection = collect([{ name: "Ajat", framework: "Mongoloquent" }]);

		const result = collection.forget(["name", "framework"]);

		expect(result.all()).toEqual([{}]);
	});
});

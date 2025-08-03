import { collect } from "../../src/index";

describe("duplicates", () => {
	it("with array of strings", () => {
		const collection = collect(["a", "b", "a", "c", "b"]);

		const duplicates = collection.duplicates();

		expect(duplicates).toEqual({
			2: "a",
			4: "b",
		});
	});

	it("with array of objects", () => {
		const collection = collect([
			{ email: "abigail@example.com", position: "Developer" },
			{ email: "james@example.com", position: "Designer" },
			{ email: "victoria@example.com", position: "Developer" },
		]);

		const duplicates = collection.duplicates("position");
		expect(duplicates).toEqual({ 2: "Developer" });
	});
});

import { collect } from "../../src/index";

describe("groupBy", () => {
	it("with key", () => {
		const collection = collect([
			{ accountId: "account-x10", product: "Chair" },
			{ accountId: "account-x10", product: "Bookcase" },
			{ accountId: "account-x11", product: "Desk" },
		]);

		const grouped = collection.groupBy("accountId");

		const result = grouped.all();

		expect(result).toEqual([
			{
				"account-x10": [
					{
						accountId: "account-x10",
						product: "Chair",
					},
					{
						accountId: "account-x10",
						product: "Bookcase",
					},
				],
			},
			{
				"account-x11": [
					{
						accountId: "account-x11",
						product: "Desk",
					},
				],
			},
		]);
	});

	it("with callback", () => {
		const collection = collect([
			{ accountId: "account-x10", product: "Chair" },
			{ accountId: "account-x10", product: "Bookcase" },
			{ accountId: "account-x11", product: "Desk" },
		]);

		const grouped = collection.groupBy((item) => item.accountId.substring(8));

		const result = grouped.all();

		expect(result).toEqual([
			{
				x10: [
					{
						accountId: "account-x10",
						product: "Chair",
					},
					{
						accountId: "account-x10",
						product: "Bookcase",
					},
				],
			},
			{
				x11: [
					{
						accountId: "account-x11",
						product: "Desk",
					},
				],
			},
		]);
	});
});

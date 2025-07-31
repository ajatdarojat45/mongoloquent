import { Document } from "mongodb";

export class LookupBuilder {
	static select(columns: string | string[], alias: string): Document[] {
		const lookup: Document[] = [];
		const _columns: string[] = [];
		const pipeline: any = [];
		let project = {
			$project: {
				document: "$$ROOT",
			},
		};

		if (typeof columns === "string") _columns.push(columns);
		else _columns.push(...columns);

		_columns.forEach((el) => {
			project = {
				...project,
				$project: {
					...project.$project,
					[`${alias}.${el}`]: 1,
				},
			};
		});

		pipeline.push(
			{
				$set: {
					[`document.${alias}`]: `$${alias}`,
				},
			},
			{
				$replaceRoot: {
					newRoot: "$document",
				},
			},
		);

		lookup.push(project, ...pipeline);

		return lookup;
	}

	static exclude(columns: string | string[], alias: string): Document[] {
		const lookup: Document[] = [];
		const _columns: string[] = [];
		// Convert columns to an array if it's a string
		if (typeof columns === "string") _columns.push(columns);
		else _columns.push(...columns);

		let project = {
			$project: {},
		};

		_columns.forEach((field: any) => {
			project = {
				...project,
				$project: {
					...project.$project,
					[`${alias}.${field}`]: 0,
				},
			};
		});

		lookup.push(project);

		return lookup;
	}

	static sort(column: string, sort: "asc" | "desc"): Document {
		const _sort = sort === "asc" ? 1 : -1;
		const $sort = {
			[column]: _sort,
		};

		return { $sort };
	}

	static skip(skip: number): Document {
		return { $skip: skip };
	}

	static limit(limit: number): Document {
		return { $limit: limit };
	}
}

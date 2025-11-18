import { Document } from "mongodb";

export class LookupBuilder {
	public static select<T>(columns: keyof T | (keyof T)[], alias: string): Document[] {
		const lookup: Document[] = [];
		const _columns: (keyof T)[] = [];
		const pipeline: any = [];
		let project = {
			$project: {
				document: "$$ROOT",
			},
		};

		if (typeof columns === "string") _columns.push(columns);
		else if (Array.isArray(columns)) _columns.push(...columns);

		_columns.forEach((el) => {
			project = {
				...project,
				$project: {
					...project.$project,
					[`${alias}.${String(el)}`]: 1,
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

	public static exclude<T>(columns: keyof T | (keyof T)[], alias: string): Document[] {
		const lookup: Document[] = [];
		const _columns: (keyof T)[] = [];

		if (typeof columns === "string") _columns.push(columns);
		else if (Array.isArray(columns)) _columns.push(...columns);

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

	public static sort<T>(column: keyof T | (string & {}), sort: "asc" | "desc"): Document {
		const _sort = sort === "asc" ? 1 : -1;
		const $sort = {
			[column]: _sort,
		};

		return { $sort };
	}

	public static skip(skip: number): Document {
		return { $skip: skip };
	}

	public static limit(limit: number): Document {
		return { $limit: limit };
	}
}

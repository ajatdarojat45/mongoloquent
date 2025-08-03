import { Collection } from "../core";
import {
	IMongoloquentSchema,
	IMongoloquentSoftDelete,
	IMongoloquentTimestamps,
} from "./index";

export interface IQueryBuilderWhere {
	column: string;
	operator: string;
	value: any;
	boolean: string;
	type: string;
}

export interface IQueryBuilderOrder {
	column: string;
	order: string | number;
	caseSensitive: boolean;
}

export interface IQueryBuilderPaginated<
	T extends Collection<any> = Collection<any>,
> {
	data: T;
	meta: {
		total: number;
		page: number;
		limit: number;
		lastPage: number;
	};
}

export type IQueryBuilderFormSchema<T> = Omit<
	T,
	| keyof IMongoloquentSchema
	| keyof IMongoloquentSoftDelete
	| keyof IMongoloquentTimestamps
>;

export interface IQueryBuilder {
	collection: string;
	connection?: string;
	databaseName?: string;
	useSoftDelete?: boolean;
	useTimestamps?: boolean;
}

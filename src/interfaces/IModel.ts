export interface IPaginate {
	data: object[];
	meta: {
		total: number;
		page: number;
		limit: number;
		lastPage: number;
	};
}

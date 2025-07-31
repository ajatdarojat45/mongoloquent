export interface IRelationshipsOptions {
	select?: string | string[];
	exclude?: string | string[];
	sort?: [string, "asc" | "desc"];
	skip?: number;
	limit?: number;
}

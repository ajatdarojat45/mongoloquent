import {
	BulkWriteOptions,
	DeleteOptions,
	Document,
	FindOneAndUpdateOptions,
	InsertOneOptions,
	ObjectId,
	UpdateOptions,
	WithId,
} from "mongodb";
import {
	IQueryBuilderFormSchema,
	IQueryBuilderOrder,
	IQueryBuilderPaginated,
	IQueryBuilderWhere,
	IRelationshipOptions,
} from "../../types";
import { Collection } from "../index";

export abstract class AbstractQueryBuilder<T = WithId<Document>> {
	protected abstract $timezone: string;
	protected abstract $connection: string;
	protected abstract $databaseName: string;
	protected abstract $collection: string;
	protected abstract $useTimestamps: boolean;
	protected abstract $useSoftDelete: boolean;
	protected abstract $attributes: Partial<T>;

	public abstract select<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this;
	public abstract exclude<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this;
	public abstract where<K extends keyof T>(
		column: K | (string & {}),
		operator: any,
		value: any,
	): this;
	public abstract orWhere<K extends keyof T>(
		column: K | (string & {}),
		operator: any,
		value: any,
	): this;
	public abstract whereNot<K extends keyof T>(
		column: K | (string & {}),
		value: any,
	): this;
	public abstract orWhereNot<K extends keyof T>(
		column: K | (string & {}),
		value: any,
	): this;
	public abstract whereIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this;
	public abstract orWhereIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this;
	public abstract whereNotIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this;
	public abstract orWhereNotIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this;
	public abstract whereBetween<K extends keyof T>(
		column: K | (string & {}),
		values: [number, number?],
	): this;
	public abstract orWhereBetween<K extends keyof T>(
		column: K | (string & {}),
		values: [number, number?],
	): this;
	public abstract whereNull<K extends keyof T>(column: K | (string & {})): this;
	public abstract orWhereNull<K extends keyof T>(
		column: K | (string & {}),
	): this;
	public abstract whereNotNull<K extends keyof T>(
		column: K | (string & {}),
	): this;
	public abstract orWhereNotNull<K extends keyof T>(
		column: K | (string & {}),
	): this;
	public abstract withTrashed(): this;
	public abstract onlyTrashed(): this;
	public abstract offset(offset: number): this;
	public abstract skip(skip: number): this;
	public abstract limit(limit: number): this;
	public abstract orderBy<K extends keyof T>(
		column: K | (string & {}),
		direction: "asc" | "desc",
		caseSensitive: boolean,
	): this;
	public abstract groupBy<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): this;

	public abstract get<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Collection<Pick<T, K>>>;
	public abstract all(): Promise<Collection<T>>;
	public abstract pluck<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Collection<Pick<T, K>>>;
	public abstract paginate(
		page: number,
		limit: number,
	): Promise<IQueryBuilderPaginated>;
	public abstract first<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Pick<T, K> | null>;
	public abstract firstOrCreate(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>>,
		options?: InsertOneOptions,
	): Promise<T>;
	public abstract firstOrNew(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>>,
		options?: InsertOneOptions,
	): Promise<T>;
	public abstract firstOrFail<K extends keyof T>(
		...columns: (K | K[])[]
	): Promise<T>;
	public abstract find(id: string | ObjectId): Promise<(this & T) | null>;
	public abstract findOrFail(id: string | ObjectId): Promise<this & T>;

	public abstract count(): Promise<number>;
	public abstract max<K extends keyof T>(
		column: K | (string & {}),
	): Promise<number>;
	public abstract min<K extends keyof T>(
		field: K | (string & {}),
	): Promise<number>;
	public abstract avg<K extends keyof T>(
		field: K | (string & {}),
	): Promise<number>;
	public abstract sum<K extends keyof T>(
		field: K | (string & {}),
	): Promise<number>;

	public abstract insert(
		doc: IQueryBuilderFormSchema<T>,
		options?: InsertOneOptions,
	): Promise<T>;
	public abstract create(
		doc: IQueryBuilderFormSchema<T>,
		options?: InsertOneOptions,
	): Promise<T>;
	public abstract insertMany(
		docs: IQueryBuilderFormSchema<T>[],
		options?: BulkWriteOptions,
	): Promise<ObjectId[]>;
	public abstract createMany(
		docs: IQueryBuilderFormSchema<T>[],
		options?: BulkWriteOptions,
	): Promise<ObjectId[]>;
	public abstract update(
		doc: Partial<IQueryBuilderFormSchema<T>>,
		options: FindOneAndUpdateOptions,
	): Promise<WithId<IQueryBuilderFormSchema<T>> | null>;
	public abstract updateOrCreate(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>>,
		options?: FindOneAndUpdateOptions | InsertOneOptions,
	): Promise<T | WithId<IQueryBuilderFormSchema<T>>>;
	public abstract updateOrInsert(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>>,
		options?: FindOneAndUpdateOptions | InsertOneOptions,
	): Promise<T | WithId<IQueryBuilderFormSchema<T>>>;
	public abstract updateMany(
		doc: Partial<IQueryBuilderFormSchema<T>>,
		options?: UpdateOptions,
	): Promise<number>;
	public abstract save(
		options?: UpdateOptions | FindOneAndUpdateOptions,
	): Promise<T | WithId<IQueryBuilderFormSchema<T>> | null>;
	public abstract delete(
		options?: DeleteOptions | UpdateOptions,
	): Promise<number>;
	public abstract forceDelete(options?: DeleteOptions): Promise<number>;
	public abstract destroy(
		...ids: (string | ObjectId | (string | ObjectId)[])[]
	): Promise<number>;
	public abstract forceDestroy(
		...ids: (string | ObjectId | (string | ObjectId)[])[]
	): Promise<number>;
	public abstract restore(options?: UpdateOptions): Promise<number>;
	public abstract fill(doc: Partial<IQueryBuilderFormSchema<T>>): this;

	public abstract hasChanges(): boolean;
	public abstract isDirty<K extends keyof T>(...fields: (K | K[])[]): boolean;
	public abstract isClean<K extends keyof T>(...fields: (K | K[])[]): boolean;
	public abstract wasChanged<K extends keyof T>(
		...fields: (K | K[])[]
	): boolean;
	public abstract getChanges(): Partial<
		Record<keyof T, { old: any; new: any }>
	>;
	public abstract getOriginal<K extends keyof T>(
		...fields: (K | K[])[]
	): Partial<T>;
	public abstract refresh(): this;

	protected abstract createProxy(): this & T;
	protected abstract trackChange<K extends keyof T>(field: K, value: any): void;

	public abstract setTimezone(timezone: string): this;
	public abstract getTimezone(): string;
	public abstract setConnection(connection: string): this;
	public abstract getConnection(): string;
	public abstract setDatabaseName(name: string): this;
	public abstract getDatabaseName(): string;
	public abstract setCollection(collection: string): this;
	public abstract getCollection(): string;
	public abstract setUseTimestamps(useTimestamps: boolean): this;
	public abstract getUseTimestamps(): boolean;
	public abstract setUseSoftDelete(useSoftDelete: boolean): this;
	public abstract getUseSoftDelete(): boolean;
	public abstract setCreatedAt(createdAt: string): this;
	public abstract getCreatedAt(): string;
	public abstract setUpdatedAt(updatedAt: string): this;
	public abstract getUpdatedAt(): string;
	public abstract setStages(documents: Document[]): this;
	public abstract addStage(document: Document): this;
	public abstract getStages(): Document[];
	public abstract setColumns<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this;
	public abstract addColumn(column: keyof T): this;
	public abstract getColumns(): (keyof T)[];
	public abstract setExcludes<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this;
	public abstract addExclude(column: keyof T): this;
	public abstract getExcludes(): (keyof T)[];
	public abstract setWheres(wheres: IQueryBuilderWhere[]): this;
	public abstract addWhere(where: IQueryBuilderWhere): this;
	public abstract getWheres(): IQueryBuilderWhere[];
	public abstract setOrders(orders: IQueryBuilderOrder[]): this;
	public abstract addOrder(order: IQueryBuilderOrder): this;
	public abstract getOrders(): IQueryBuilderOrder[];
	public abstract setGroups(columns: (keyof T)[]): this;
	public abstract addGroup(column: keyof T): this;
	public abstract getGroups(): (keyof T)[];
	public abstract setWithTrashed(withTrashed: boolean): this;
	public abstract getWithTrashed(): boolean;
	public abstract setOnlyTrashed(onlyTrashed: boolean): this;
	public abstract getOnlyTrashed(): boolean;
	public abstract setOffset(offset: number): this;
	public abstract getOffset(): number;
	public abstract setId(id: ObjectId | string | null): this;
	public abstract getId(): ObjectId | string | null;
	public abstract setOriginal(original: Partial<T>): this;
	//public abstract getOriginal(): Partial<T>
	public abstract setChanges(changes: Partial<Record<keyof T, any>>): this;
	// public abstract getChanges(): Partial<Record<keyof T, any>>
	public abstract setLookups(lookups: Document[]): this;
	public abstract addLookup(lookup: Document): this;
	public abstract getLookups(): Document[];
	public abstract setIsDeleted(isDeleted: string): this;
	public abstract getIsDeleted(): string;
	public abstract setDeletedAt(deletedAt: string): this;
	public abstract getDeletedAt(): string;
	public abstract setLimit(limit: number): this;
	public abstract getLimit(): number;
	public abstract setAttributes(attributes: Partial<T>): this;
	public abstract getAttributes(): Partial<T>;
	public abstract setAlias(alias: string): this;
	public abstract getAlias(): string;
	public abstract setOptions(options: IRelationshipOptions): this;
	public abstract getOptions(): IRelationshipOptions;
}

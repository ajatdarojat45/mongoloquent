import {
	BulkWriteOptions,
	DeleteOptions,
	Document,
	FindOneAndUpdateOptions,
	InsertOneOptions,
	ObjectId,
	OptionalUnlessRequiredId,
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
import { AbstractQueryBuilder } from "./index";
import { Database, Collection } from "../index";
import {
	MongoloquentNotFoundException,
	MongoloquentQueryException,
} from "../../exceptions";
import { dayjs } from "../../utils";
import {
	MONGOLOQUENT_DATABASE_NAME,
	MONGOLOQUENT_DATABASE_URI,
	TIMEZONE,
	OPERATORS,
} from "../../constants";

export abstract class QueryBuilder<T = any> extends AbstractQueryBuilder<T> {
	protected $timezone: string = "";
	protected $connection: string = "";
	protected $databaseName: string = "";
	protected $collection: string = "";
	protected $useTimestamps: boolean = true;
	protected $useSoftDelete: boolean = false;

	private $createdAt: string = "createdAt";
	private $updatedAt: string = "updatedAt";
	private $stages: Document[] = [];
	private $columns: (keyof T)[] = [];
	private $excludes: (keyof T)[] = [];
	private $wheres: IQueryBuilderWhere[] = [];
	private $orders: IQueryBuilderOrder[] = [];
	private $groups: (keyof T)[] = [];
	private $withTrashed: boolean = false;
	private $onlyTrashed: boolean = false;
	private $offset: number = 0;
	private $id: string | ObjectId | null = null;
	private $original: Partial<T> = {};
	private $changes: Partial<Record<keyof T, any>> = {};
	private $lookups: Document[] = [];
	private $isDeleted: string = "isDeleted";
	private $deletedAt: string = "deletedAt";
	private $limit: number = 0;
	private $attributes: Partial<T> = {};
	private $alias: string = "";
	private $options: IRelationshipOptions = {};

	constructor() {
		super();
		this.$timezone = this.$timezone || TIMEZONE;
		this.$connection = this.$connection || MONGOLOQUENT_DATABASE_URI;
		this.$databaseName = this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
		this.$collection =
			this.$collection || `${this.constructor.name.toLowerCase()}s`;
	}

	public select<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this {
		return this.setColumns(...columns);
	}

	public exclude<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this {
		return this.setExcludes(...columns);
	}

	public where<K extends keyof T>(
		column: K | (string & {}),
		operator: any,
		value: any = null,
	): this {
		let _value = value || operator;
		let _operator = value ? operator : "eq";

		return this.formatAndSaveWhereCondition(column, _operator, _value, "and");
	}

	public orWhere<K extends keyof T>(
		column: K | (string & {}),
		operator: any,
		value: any = null,
	): this {
		let _value = value || operator;
		let _operator = value ? operator : "eq";

		return this.formatAndSaveWhereCondition(column, _operator, _value, "or");
	}

	public whereNot<K extends keyof T>(
		column: K | (string & {}),
		value: any,
	): this {
		return this.formatAndSaveWhereCondition(column, "ne", value, "and");
	}

	public orWhereNot<K extends keyof T>(
		column: K | (string & {}),
		value: any,
	): this {
		return this.formatAndSaveWhereCondition(column, "ne", value, "or");
	}

	public whereIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this {
		return this.formatAndSaveWhereCondition(column, "in", values, "and");
	}

	public orWhereIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this {
		return this.formatAndSaveWhereCondition(column, "in", values, "or");
	}

	public whereNotIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this {
		return this.formatAndSaveWhereCondition(column, "nin", values, "and");
	}

	public orWhereNotIn<K extends keyof T>(
		column: K | (string & {}),
		values: any[],
	): this {
		return this.formatAndSaveWhereCondition(column, "nin", values, "or");
	}

	public whereBetween<K extends keyof T>(
		column: K | (string & {}),
		values: [number, number?],
	): this {
		return this.formatAndSaveWhereCondition(column, "between", values, "and");
	}

	public orWhereBetween<K extends keyof T>(
		column: K | (string & {}),
		values: [number, number?],
	): this {
		return this.formatAndSaveWhereCondition(column, "between", values, "or");
	}

	public whereNull<K extends keyof T>(column: K | (string & {})): this {
		return this.formatAndSaveWhereCondition(column, "eq", null, "and");
	}

	public orWhereNull<K extends keyof T>(column: K | (string & {})): this {
		return this.formatAndSaveWhereCondition(column, "eq", null, "or");
	}

	public whereNotNull<K extends keyof T>(column: K | (string & {})): this {
		return this.formatAndSaveWhereCondition(column, "ne", null, "and");
	}

	public orWhereNotNull<K extends keyof T>(column: K | (string & {})): this {
		return this.formatAndSaveWhereCondition(column, "ne", null, "or");
	}

	public withTrashed(): this {
		return this.setWithTrashed(true);
	}

	public onlyTrashed(): this {
		return this.setOnlyTrashed(true);
	}

	public offset(offset: number): this {
		return this.setOffset(offset);
	}

	public skip(skip: number): this {
		return this.offset(skip);
	}

	public limit(limit: number): this {
		return this.setLimit(limit);
	}

	public orderBy<K extends keyof T>(
		column: K | (string & {}),
		direction: "asc" | "desc" = "asc",
		caseSensitive: boolean = false,
	): this {
		const payload = {
			column,
			order: direction,
			caseSensitive,
		} as IQueryBuilderOrder;
		return this.addOrder(payload);
	}

	public groupBy<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): this {
		const flattenedFields = fields.flat() as (keyof T)[];
		this.$groups = [...this.$groups, ...flattenedFields];
		return this;
	}

	public async get<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Collection<T>> {
		try {
			this.setColumns(...fields);
			const aggregate = await this.generateAggregateForMongoDBQuery();
			const data = (await aggregate.toArray()) as T[];
			const collection = new Collection<T>(...data);
			return collection;
		} catch (error) {
			throw new MongoloquentQueryException("Failed to fetch documents", error);
		}
	}

	public async all(): Promise<Collection<T>> {
		return this.get();
	}

	public async pluck<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	) {
		const result = await this.get(...fields);
		const flattenedFields = fields.flat() as K[];
		return result.pluck(...flattenedFields);
	}

	public async paginate(
		page: number = 1,
		limit: number = 15,
	): Promise<IQueryBuilderPaginated> {
		try {
			this.checkSoftDelete()
				.generateColumnsForMongoDBQuery()
				.generateExcludesForMongoDBQuery()
				.generateConditionsForMongoDBQuery()
				.generateOrdersForMongoDBQuery()
				.generateGroupsForMongoDBQuery();

			const collection = this.getMongoDBCollection();
			const stages = this.getStages();
			const lookups = this.getLookups();
			const aggregate = collection.aggregate([...stages, ...lookups]);

			let totalResult = await collection
				.aggregate([
					...stages,
					{
						$count: "total",
					},
				])
				.next();
			let total = 0;

			if (totalResult?.total) total = totalResult?.total;

			const result = await aggregate
				.skip((page - 1) * limit)
				.limit(limit)
				.toArray();

			this.resetQueryProperties();

			return {
				data: result as Collection<T>,
				meta: {
					total,
					page,
					limit,
					lastPage: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			throw new MongoloquentQueryException("Failed to paginate query", error);
		}
	}

	public async first<K extends keyof T>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<T | null> {
		let data = await this.get(...fields);
		if (data && data.length > 0) {
			this.$original = { ...data[0] };
		}

		if (data.length === 0) {
			return null;
		}

		let result = data[0] as T;
		return result as T;
	}

	public async firstOrCreate(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>> | undefined,
		options?: InsertOneOptions | undefined,
	): Promise<T> {
		for (var key in filter) {
			if (filter.hasOwnProperty(key)) {
				this.where(key as keyof T, filter[key as keyof typeof filter]);
			}
		}

		const data = await this.first();
		if (data) return data;

		const payload = { ...filter, ...doc } as IQueryBuilderFormSchema<T>;
		return this.insert(payload as IQueryBuilderFormSchema<T>, options);
	}

	public async firstOrNew(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>> | undefined,
		options?: InsertOneOptions | undefined,
	): Promise<T> {
		return this.firstOrCreate(filter, doc, options);
	}

	public async firstOrFail<K extends keyof T>(
		...columns: (K | K[])[]
	): Promise<T> {
		const data = await this.first(...columns);
		if (!data) {
			throw new MongoloquentNotFoundException(
				"No document found matching the query",
			);
		}
		return data;
	}

	public async find(id: string | ObjectId): Promise<(this & T) | null> {
		const _id = new ObjectId(id);
		this.setId(_id);

		let data = await this.get();
		if (data && data.length > 0) {
			this.$original = { ...data[0] };
		}

		if (data.length === 0) {
			return null;
		}

		let result = data[0] as T;
		const self = this;
		const handler = {
			set(target: any, prop: string, value: any) {
				// @ts-ignore
				if (prop in result) {
					self.trackChange(prop as keyof T, value);
				}
				target[prop] = value;
				return true;
			},
		};

		// @ts-ignore
		this.$id = result?._id;
		Object.assign(this, result);

		return new Proxy(this, handler) as this & T;
	}

	public async findOrFail(id: string | ObjectId): Promise<this & T> {
		const data = await this.find(id);
		if (!data) {
			throw new MongoloquentNotFoundException(
				"No document found with the given ID",
			);
		}
		return data;
	}

	public async count(): Promise<number> {
		try {
			const collection = this.getMongoDBCollection();
			this.checkSoftDelete();
			this.generateConditionsForMongoDBQuery();

			const stages = this.getStages();
			const aggregate = await collection
				.aggregate([
					...stages,
					{
						$count: "total",
					},
				])
				.next();

			this.resetQueryProperties();
			return aggregate?.total || 0;
		} catch (error) {
			throw new MongoloquentQueryException("Failed to count documents", error);
		}
	}

	public async max<K extends keyof T>(
		column: (string & {}) | K,
	): Promise<number> {
		return this.runAggregate(column, "max");
	}

	public async min<K extends keyof T>(
		column: (string & {}) | K,
	): Promise<number> {
		return this.runAggregate(column, "min");
	}

	public async avg<K extends keyof T>(
		column: (string & {}) | K,
	): Promise<number> {
		return this.runAggregate(column, "avg");
	}

	public async sum<K extends keyof T>(
		column: (string & {}) | K,
	): Promise<number> {
		return this.runAggregate(column, "sum");
	}

	public async insert(
		doc: IQueryBuilderFormSchema<T>,
		options?: InsertOneOptions | undefined,
	): Promise<T> {
		try {
			const collection = this.getMongoDBCollection();
			let newDoc = this.checkUseTimestamps(doc);
			newDoc = this.checkUseSoftdelete(newDoc);

			if (typeof this.$attributes === "object")
				newDoc = { ...newDoc, ...this.$attributes };

			const data = await collection?.insertOne(
				newDoc as OptionalUnlessRequiredId<IQueryBuilderFormSchema<T>>,
				options,
			);

			this.resetQueryProperties();
			return { _id: data?.insertedId as ObjectId, ...newDoc } as T;
		} catch (error) {
			throw new MongoloquentQueryException("Failed to insert document", error);
		}
	}

	public create(
		doc: IQueryBuilderFormSchema<T>,
		options?: InsertOneOptions | undefined,
	): Promise<T> {
		return this.insert(doc, options);
	}

	public async insertMany(
		docs: IQueryBuilderFormSchema<T>[],
		options?: BulkWriteOptions | undefined,
	): Promise<ObjectId[]> {
		try {
			const collection = this.getMongoDBCollection();

			const newDocs = docs.map((el) => {
				let newEl = this.checkUseTimestamps(el);
				newEl = this.checkUseSoftdelete(newEl);

				if (typeof this.$attributes === "object")
					newEl = { ...newEl, ...this.$attributes };

				return newEl;
			});

			const data = await collection?.insertMany(
				newDocs as OptionalUnlessRequiredId<IQueryBuilderFormSchema<T>>[],
				options,
			);

			const result: ObjectId[] = [];
			for (const key in data?.insertedIds) {
				result.push(
					data?.insertedIds[key as unknown as keyof typeof data.insertedIds],
				);
			}

			this.resetQueryProperties();
			return result;
		} catch (error) {
			throw new MongoloquentQueryException(
				"Failed to insert multiple documents",
				error,
			);
		}
	}

	public createMany(
		docs: IQueryBuilderFormSchema<T>[],
		options?: BulkWriteOptions | undefined,
	): Promise<ObjectId[]> {
		return this.insertMany(docs, options);
	}

	public async update(
		doc: Partial<IQueryBuilderFormSchema<T>>,
		options: FindOneAndUpdateOptions,
	): Promise<WithId<IQueryBuilderFormSchema<T>> | null> {
		try {
			const collection = this.getMongoDBCollection();
			this.checkSoftDelete();
			this.generateConditionsForMongoDBQuery();
			const stages = this.getStages();
			let filter = {};
			if (stages.length > 0) filter = stages[0].$match;
			let newDoc = this.checkUseTimestamps(doc, false);
			newDoc = this.checkUseSoftdelete(newDoc);
			delete (newDoc as any)._id;

			const data = await collection.findOneAndUpdate(
				{ ...filter },
				{
					$set: {
						...(newDoc as Partial<T>),
					},
				},
				{
					...options,
					returnDocument: "after",
				},
			);

			this.resetQueryProperties();
			return data;
		} catch (error) {
			throw new MongoloquentQueryException("Failed to update document", error);
		}
	}

	public async updateOrCreate(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>> | undefined,
		options?: FindOneAndUpdateOptions | InsertOneOptions | undefined,
	): Promise<T | WithId<IQueryBuilderFormSchema<T>>> {
		for (var key in filter) {
			if (filter.hasOwnProperty(key)) {
				this.where(key as keyof T, filter[key as keyof typeof filter]);
			}
		}

		const payload = { ...filter, ...doc };
		const data = await this.update(payload, options as FindOneAndUpdateOptions);
		if (data) return data;

		return this.insert(payload as IQueryBuilderFormSchema<T>, options);
	}

	public updateOrInsert(
		filter: Partial<IQueryBuilderFormSchema<T>>,
		doc?: Partial<IQueryBuilderFormSchema<T>> | undefined,
		options?: FindOneAndUpdateOptions | InsertOneOptions | undefined,
	): Promise<T | WithId<IQueryBuilderFormSchema<T>>> {
		return this.updateOrCreate(filter, doc, options);
	}

	public async updateMany(
		doc: Partial<IQueryBuilderFormSchema<T>>,
		options?: UpdateOptions | undefined,
	): Promise<number> {
		try {
			const collection = this.getMongoDBCollection();

			this.checkSoftDelete();
			this.generateConditionsForMongoDBQuery();

			let filter = {};
			const stages = this.getStages();
			if (stages.length > 0) filter = stages[0].$match;

			let newDoc = this.checkUseTimestamps(doc, false);
			newDoc = this.checkUseSoftdelete(newDoc);
			delete (newDoc as any)._id;

			const data = await collection.updateMany(
				{ ...filter },
				{
					$set: {
						...(newDoc as Partial<T>),
					},
				},
				options,
			);

			this.resetQueryProperties();
			return data.modifiedCount;
		} catch (error) {
			throw new MongoloquentQueryException(
				"Failed to update multiple documents",
				error,
			);
		}
	}

	public async save(
		options?: UpdateOptions | FindOneAndUpdateOptions | undefined,
	): Promise<T | WithId<IQueryBuilderFormSchema<T>> | null> {
		let payload = {};
		for (const key in this.$changes) {
			if (key.startsWith("$") || key === "_id") continue;
			payload = {
				...payload,
				// @ts-ignore
				[key]: this.$changes[key],
			};
		}

		if (Object.keys(this.$original).length === 0) {
			const result = await this.insert(
				payload as IQueryBuilderFormSchema<T>,
				options,
			);
			this.$original = { ...result };
			Object.assign(this, result);
			// @ts-ignore
			this.$id = this._id;
			return result;
		} else {
			// @ts-ignore
			const id = this.$original?._id;
			return this.where("_id" as keyof T, id).update(
				payload as IQueryBuilderFormSchema<T>,
				options as FindOneAndUpdateOptions,
			);
		}
	}

	public async delete(
		options?: DeleteOptions | UpdateOptions | undefined,
	): Promise<number> {
		try {
			const collection = this.getMongoDBCollection();
			this.generateConditionsForMongoDBQuery();
			const stages = this.getStages();
			let filter = {};
			if (stages.length > 0) filter = stages[0].$match;

			if (this.getUseSoftDelete()) {
				let doc = this.checkUseTimestamps({}, false);
				doc = this.checkUseSoftdelete(doc, true);

				const data = await collection?.updateMany(
					{ ...filter },
					{
						$set: {
							...(doc as Partial<T>),
						},
					},
					options,
				);

				this.resetQueryProperties();
				return data?.modifiedCount || 0;
			}

			const data = await collection?.deleteMany(filter, options);
			this.resetQueryProperties();

			return data?.deletedCount || 0;
		} catch (error) {
			throw new MongoloquentQueryException("Failed to delete documents", error);
		}
	}

	public async forceDelete(
		options?: DeleteOptions | undefined,
	): Promise<number> {
		try {
			const collection = this.getMongoDBCollection();
			this.generateConditionsForMongoDBQuery();
			const stages = this.getStages();
			let filter = {};
			if (stages.length > 0) filter = stages[0].$match;

			const data = await collection?.deleteMany(filter, options);
			this.resetQueryProperties();

			return data?.deletedCount || 0;
		} catch (error) {
			throw new MongoloquentQueryException(
				"Failed to force delete documents",
				error,
			);
		}
	}

	public async destroy(
		...ids: (string | ObjectId | (string | ObjectId)[])[]
	): Promise<number> {
		let flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
			return acc.concat(Array.isArray(id) ? id : [id]);
		}, []);

		flattenedIds = flattenedIds.map((el) => {
			if (typeof el === "string") return new ObjectId(el);
			return el;
		});

		this.where("_id" as keyof T, "in", flattenedIds);
		return this.delete();
	}

	public async forceDestroy(
		...ids: (string | ObjectId | (string | ObjectId)[])[]
	): Promise<number> {
		try {
			let flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
				return acc.concat(Array.isArray(id) ? id : [id]);
			}, []);

			flattenedIds = flattenedIds.map((el) => {
				if (typeof el === "string") return new ObjectId(el);
				return el;
			});

			this.where("_id" as keyof T, "in", flattenedIds);
			this.onlyTrashed();
			this.generateConditionsForMongoDBQuery();
			const stages = this.getStages();

			let filter = {};
			if (stages.length > 0) filter = stages[0].$match;

			const collection = this.getMongoDBCollection();
			const data = await collection.deleteMany(filter);
			this.resetQueryProperties();

			return data.deletedCount;
		} catch (error) {
			throw new MongoloquentQueryException(
				"Failed to force destroy documents",
				error,
			);
		}
	}

	public async restore(options?: UpdateOptions | undefined): Promise<number> {
		try {
			this.onlyTrashed();
			const payload = {
				[this.getIsDeleted()]: false,
				[this.getDeletedAt()]: null,
			} as Partial<IQueryBuilderFormSchema<T>>;

			return await this.updateMany(payload, options);
		} catch (error) {
			throw new MongoloquentQueryException(
				"Failed to restore documents",
				error,
			);
		}
	}

	public fill(doc: Partial<IQueryBuilderFormSchema<T>>): this {
		Object.assign(this, doc);
		return this;
	}

	public hasChanges(): boolean {
		return Object.keys(this.$changes).length > 0;
	}

	public isDirty<K extends keyof T>(...fields: (K | K[])[]): boolean {
		if (fields && fields.length > 0) {
			const flattenedFields = fields.flat() as (keyof T)[];
			return flattenedFields.some((field) => field in this.$changes);
		}

		return this.hasChanges();
	}

	public isClean<K extends keyof T>(...fields: (K | K[])[]): boolean {
		if (fields && fields.length > 0) {
			const flattenedFields = fields.flat() as (keyof T)[];
			return flattenedFields.every((field) => !(field in this.$changes));
		}
		return !this.hasChanges();
	}

	public wasChanged<K extends keyof T>(...fields: (K | K[])[]): boolean {
		if (fields && fields.length > 0) {
			const flattenedFields = fields.flat() as (keyof T)[];
			return flattenedFields.some((field) => {
				const _new = this.$changes[field];
				const old = this.$original[field];
				return _new && old !== _new;
			});
		}
		return this.hasChanges();
	}

	public getChanges(): Partial<Record<keyof T, any>> {
		return this.$changes;
	}

	public getOriginal<K extends keyof T>(...fields: (K | K[])[]): Partial<T> {
		if (fields && fields.length > 0) {
			const flattenedFields = fields.flat() as (keyof T)[];
			const original: Partial<Record<keyof T, any>> = {};
			flattenedFields.forEach((field) => {
				if (field in this.$original) {
					original[field] = this.$original[field];
				}
			});
			return original;
		}

		return this.$original;
	}

	public refresh(): this {
		this.$changes = {};
		Object.assign(this, this.$original);
		return this;
	}

	protected createProxy(): this & T {
		return new Proxy(this, {
			set: (target, prop, value) => {
				// @ts-ignore
				if (!prop.startsWith("$") && value !== target.$original[prop]) {
					// @ts-ignore
					target.$changes[prop] = value;
				}

				// @ts-ignore
				target[prop] = value;
				return true;
			},
		}) as this & T;
	}

	protected trackChange<K extends keyof T>(field: K, value: any): void {
		if (!(field in this.$original)) {
			const schema = (this.constructor as any).$schema;
			this.$original[field] =
				schema && field in schema ? schema[field] : undefined;
		}

		if (this.$original[field] !== value) {
			if (field === ("$original" as any)) {
				return;
			}

			if (!this.$changes[field]) {
				this.$changes[field] = value;
			} else {
				this.$changes[field] = value;
			}
		}
	}

	private async runAggregate<K extends keyof T>(
		field: K | (string & {}),
		type: "avg" | "sum" | "max" | "min",
	): Promise<number> {
		try {
			const collection = this.getMongoDBCollection();
			//await this.checkRelation();
			this.checkSoftDelete();
			this.generateConditionsForMongoDBQuery();

			const stages = this.getStages();
			const aggregate = await collection
				.aggregate([
					...stages,
					{
						$group: {
							_id: null,
							[type]: {
								// @ts-ignore
								[`$${type}`]: `$${field}`,
							},
						},
					},
				])
				.next();

			this.resetQueryProperties();
			return typeof aggregate?.[type] === "number" ? aggregate[type] : 0;
		} catch (error) {
			throw new MongoloquentQueryException(
				`Failed to calculate ${type} for field ${field as string}`,
				error,
			);
		}
	}

	private formatAndSaveWhereCondition<K extends keyof T>(
		column: K | (string & {}),
		operator: any,
		value: any,
		boolean: string = "and",
	): this {
		const ep = ["eq", "ne", "=", "!="];
		let type = "R";
		if (ep.includes(operator)) type = "E";

		const where = {
			column,
			operator: operator,
			value,
			boolean,
			type,
		} as IQueryBuilderWhere;
		return this.addWhere(where);
	}

	private async generateAggregateForMongoDBQuery() {
		try {
			this.checkSoftDelete()
				.generateConditionsForMongoDBQuery()
				.generateColumnsForMongoDBQuery()
				.generateExcludesForMongoDBQuery()
				.checkOffset()
				.checkLimit()
				.generateOrdersForMongoDBQuery()
				.generateGroupsForMongoDBQuery();

			const collection = this.getMongoDBCollection();
			const stages = this.getStages();
			const lookups = this.getLookups();

			this.$stages = [];
			this.$columns = [];
			this.$excludes = [];

			this.generateConditionsForMongoDBQuery(true);
			const nestedStages = this.getStages();

			const aggregate = collection?.aggregate([
				...stages,
				...lookups,
				...nestedStages,
			]);

			this.resetQueryProperties();

			return aggregate;
		} catch (error) {
			throw new MongoloquentQueryException(
				"Failed to generate aggregate query",
				error,
			);
		}
	}

	private checkSoftDelete<K extends keyof T>(): this {
		if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
			this.where(this.$isDeleted as K, false);

		return this;
	}

	private generateConditionsForMongoDBQuery(isNested: boolean = false): this {
		let $and: Document[] = [];
		let $or: Document[] = [];

		if (this.$id) {
			this.addStage({ $match: { _id: new ObjectId(this.$id) } });
		}

		// sort by type(E/R/S) for better peformace query in MongoDB
		const typeOrder = ["E", "R", "S"];
		this.getWheres()
			.filter((el) =>
				isNested ? el.column.includes(".") : !el.column.includes("."),
			)
			.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type))
			.forEach((el) => {
				const op = OPERATORS.find(
					(op) =>
						op.operator === el.operator || op.mongoOperator === el.operator,
				);

				let value;
				if (el.column === "_id") {
					if (Array.isArray(el.value))
						value = el.value.map((val) => new ObjectId(val));
					else value = new ObjectId(el.value);
				}

				let condition = {
					[el.column]: {
						[`$${op?.mongoOperator}`]: value || el.value,
					},
					$options: op?.options,
				};

				if (el.operator === "between")
					condition = {
						[el.column]: {
							$gte: el.value?.[0],
							$lte: el.value?.[el.value.length - 1],
						},
						$options: op?.options,
					};

				if (!condition.$options) delete condition.$options;

				if (el.boolean === "and") $and.push(condition);
				else $or.push(condition);
			});

		if ($or.length > 0) {
			if ($and.length > 0) $or.push({ $and });
			let queries = {
				$or,
			};

			if (this.getUseSoftDelete() && !this.getWithTrashed()) {
				queries = {
					[this.$isDeleted]: false,
					$or,
				};
			}

			if (this.getUseSoftDelete() && this.getOnlyTrashed()) {
				queries = {
					[this.$isDeleted]: true,
					$or,
				};
			}

			this.addStage({ $match: queries });
			return this;
		}

		if ($and.length > 0) {
			let queries = {
				$and,
			};

			if (this.getOnlyTrashed()) {
				queries = {
					[this.$isDeleted]: true,
					$and,
				};
			}
			this.addStage({ $match: queries });
			return this;
		}

		if (this.getOnlyTrashed()) {
			this.addStage({ $match: { [this.$isDeleted]: true } });
		}

		return this;
	}

	private generateColumnsForMongoDBQuery(): this {
		let $project = {};
		this.getColumns().forEach((el) => {
			$project = { ...$project, [el]: 1 };
		});
		if (Object.keys($project).length > 0) this.addStage({ $project });

		return this;
	}

	private generateExcludesForMongoDBQuery(): this {
		let $project = {};
		this.getExcludes().forEach((el) => {
			$project = { ...$project, [el]: 0 };
		});
		if (Object.keys($project).length > 0) this.addStage({ $project });

		return this;
	}

	private checkUseTimestamps(
		doc: Partial<IQueryBuilderFormSchema<T>>,
		isNew: boolean = true,
	): Partial<IQueryBuilderFormSchema<T>> {
		if (this.getUseTimestamps()) {
			const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
			const now = dayjs.utc(current).tz(this.$timezone).toDate();

			if (!isNew) return { ...doc, [this.getUpdatedAt()]: now };

			return { ...doc, [this.getCreatedAt()]: now, [this.getUpdatedAt()]: now };
		}

		return doc;
	}

	private checkUseSoftdelete(
		doc: Partial<IQueryBuilderFormSchema<T>>,
		isDeleted: boolean = false,
	): Partial<IQueryBuilderFormSchema<T>> {
		if (this.getUseSoftDelete()) {
			if (isDeleted) {
				const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
				const now = dayjs.utc(current).tz(this.$timezone).toDate();

				return {
					...doc,
					[this.getIsDeleted()]: true,
					[this.getDeletedAt()]: now,
				};
			}

			return { ...doc, [this.getIsDeleted()]: false };
		}

		return doc;
	}

	private checkLimit(): this {
		if (this.getLimit() > 0) this.addStage({ $limit: this.$limit });

		return this;
	}

	private checkOffset(): this {
		if (this.getOffset() > 0) this.addStage({ $skip: this.$offset });

		return this;
	}

	private generateOrdersForMongoDBQuery(): this {
		let $project = {
			document: "$$ROOT",
		};
		let $sort = {};

		this.getOrders().forEach((el) => {
			$project = { ...$project, [el.column]: 1 };
			const direction = el.order === "asc" ? 1 : -1;

			if (el.caseSensitive) {
				$project = {
					...$project,
					[`lowercase_${el.column}`]: { $toLower: `$${el.column}` },
				};
				$sort = {
					...$sort,
					[`lowercase_${el.column}`]: direction,
				};
			} else $sort = { ...$sort, [el.column]: direction };
		});

		if (this.$orders.length > 0)
			this.addStage({ $project })
				.addStage({ $sort })
				.addStage({
					$replaceRoot: {
						newRoot: "$document",
					},
				});

		return this;
	}

	private generateGroupsForMongoDBQuery(): this {
		let _id = {};

		this.getGroups().forEach((el: any) => {
			_id = { ..._id, [el]: `$${el}` };
		});

		if (this.$groups.length > 0)
			return this.addStage({
				$group: { _id, count: { $sum: 1 } },
			});
		return this;
	}

	private getMongoDBCollection(collectionName?: string) {
		const db = Database.getDb(this.$connection, this.$databaseName);
		return db.collection<IQueryBuilderFormSchema<T>>(
			collectionName || this.$collection,
		);
	}

	private resetQueryProperties(): this {
		return this.setWithTrashed(false)
			.setOnlyTrashed(false)
			.setStages([])
			.setLookups([])
			.setColumns([])
			.setExcludes([])
			.setWheres([])
			.setOrders([])
			.setGroups([])
			.setOffset(0)
			.setLimit(0);
	}

	public setTimezone(timezone: string): this {
		this.$timezone = timezone;
		return this;
	}

	public getTimezone(): string {
		return this.$timezone;
	}

	public setConnection(connection: string): this {
		this.$connection = connection;
		return this;
	}

	public getConnection(): string {
		return this.$connection;
	}

	public setDatabaseName(name: string): this {
		this.$databaseName = name;

		return this;
	}

	public getDatabaseName(): string {
		return this.$databaseName;
	}

	public setCollection(collection: string): this {
		this.$collection = collection;
		return this;
	}

	public getCollection(): string {
		return this.$collection;
	}

	public setUseTimestamps(useTimestamps: boolean): this {
		this.$useTimestamps = useTimestamps;
		return this;
	}

	public getUseTimestamps(): boolean {
		return this.$useTimestamps;
	}

	public setUseSoftDelete(useSoftDelete: boolean): this {
		this.$useSoftDelete = useSoftDelete;
		return this;
	}

	public getUseSoftDelete(): boolean {
		return this.$useSoftDelete;
	}

	public setCreatedAt(createdAt: string): this {
		this.$createdAt = createdAt;
		return this;
	}

	public getCreatedAt(): string {
		return this.$createdAt;
	}

	public setUpdatedAt(updatedAt: string): this {
		this.$updatedAt = updatedAt;
		return this;
	}

	public getUpdatedAt(): string {
		return this.$updatedAt;
	}

	public setStages(documents: Document[]): this {
		this.$stages = documents;
		return this;
	}

	public addStage(document: Document): this {
		this.$stages.push(document);
		return this;
	}

	public getStages(): Document[] {
		return this.$stages;
	}

	setColumns<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this {
		if (Array.isArray(columns)) {
			const flattenedColumns = columns.flat() as unknown as keyof T[];
			this.$columns = [
				...this.$columns,
				...(flattenedColumns as unknown as (keyof T)[]),
			];
		} else this.$columns = [...this.$columns, columns];

		return this;
	}

	public addColumn(column: keyof T): this {
		this.$columns.push(column);
		return this;
	}

	public getColumns(): (keyof T)[] {
		return this.$columns;
	}

	public setExcludes<K extends keyof T>(
		...columns: (K | (string & {}) | (K | (string & {}))[])[]
	): this {
		if (Array.isArray(columns)) {
			const flattenedColumns = columns.flat() as unknown as keyof T[];
			this.$excludes = [
				...this.$excludes,
				...(flattenedColumns as unknown as (keyof T)[]),
			];
		} else this.$excludes = [...this.$excludes, columns];

		return this;
	}

	public addExclude(column: keyof T): this {
		this.$excludes.push(column);
		return this;
	}

	public getExcludes(): (keyof T)[] {
		return this.$excludes;
	}

	public setWheres(wheres: IQueryBuilderWhere[]): this {
		this.$wheres = wheres;
		return this;
	}

	public addWhere(where: IQueryBuilderWhere): this {
		this.$wheres.push(where);
		return this;
	}

	public getWheres(): IQueryBuilderWhere[] {
		return this.$wheres;
	}

	public setOrders(orders: IQueryBuilderOrder[]): this {
		this.$orders = orders;
		return this;
	}

	public addOrder(order: IQueryBuilderOrder): this {
		this.$orders.push(order);
		return this;
	}

	public getOrders(): IQueryBuilderOrder[] {
		return this.$orders;
	}

	public setGroups(groups: (keyof T)[]): this {
		this.$groups = groups;
		return this;
	}

	public addGroup(group: keyof T): this {
		this.$groups.push(group);
		return this;
	}

	public getGroups(): (keyof T)[] {
		return this.$groups;
	}

	public setWithTrashed(withTrashed: boolean): this {
		this.$withTrashed = withTrashed;
		return this;
	}

	public getWithTrashed(): boolean {
		return this.$withTrashed;
	}

	public setOnlyTrashed(onlyTrashed: boolean): this {
		this.$onlyTrashed = onlyTrashed;
		return this;
	}

	public getOnlyTrashed(): boolean {
		return this.$onlyTrashed;
	}

	public setOffset(offset: number): this {
		this.$offset = offset;
		return this;
	}

	public getOffset(): number {
		return this.$offset;
	}

	public setId(id: string | ObjectId | null): this {
		this.$id = id;
		return this;
	}

	public getId(): string | ObjectId | null {
		return this.$id;
	}

	public setOriginal(original: Partial<T>): this {
		this.$original = original;
		return this;
	}

	public setChanges(changes: Partial<Record<keyof T, any>>): this {
		this.$changes = changes;
		return this;
	}

	public setLookups(lookups: Document[]): this {
		this.$lookups = lookups;
		return this;
	}

	public addLookup(lookup: Document): this {
		this.$lookups.push(lookup);
		return this;
	}

	public getLookups(): Document[] {
		return this.$lookups;
	}

	public setIsDeleted(isDeleted: string): this {
		this.$isDeleted = isDeleted;
		return this;
	}

	public getIsDeleted(): string {
		return this.$isDeleted;
	}

	public setDeletedAt(deletedAt: string): this {
		this.$deletedAt = deletedAt;
		return this;
	}

	public getDeletedAt() {
		return this.$deletedAt;
	}

	public setLimit(limit: number): this {
		this.$limit = limit;
		return this;
	}

	public getLimit(): number {
		return this.$limit;
	}

	public setAttributes(attributes: Partial<T>): this {
		this.$attributes = attributes;
		return this;
	}

	public getAttributes(): Partial<T> {
		return this.$attributes;
	}

	public setAlias(alias: string): this {
		this.$alias = alias;
		return this;
	}

	public getAlias(): string {
		return this.$alias;
	}

	public setOptions(options: IRelationshipOptions): this {
		this.$options = options;
		return this;
	}

	public getOptions(): IRelationshipOptions {
		return this.$options;
	}
}

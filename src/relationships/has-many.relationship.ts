import { BulkWriteOptions, Document, InsertOneOptions } from "mongodb";
import {
	IQueryBuilderFormSchema,
	IQueryBuilderPaginated,
	IRelationshipHasMany,
	Collection,
	Model,
	QueryBuilder,
	LookupBuilder,
} from "../index";

export class HasMany<T = any, M = any> extends QueryBuilder<M> {
	model: Model<T>;
	relatedModel: Model<M>;
	localKey: keyof T;
	foreignKey: keyof M;

	constructor(
		model: Model<T>,
		relatedModel: Model<M>,
		foreignKey: keyof M,
		localKey: keyof T,
	) {
		super();
		this.model = model;
		this.relatedModel = relatedModel;
		this.localKey = localKey;
		this.foreignKey = foreignKey;

		this.setConnection(relatedModel["$connection"]);
		this.setCollection(relatedModel["$collection"]);
		this.setDatabaseName(relatedModel["$databaseName"]);
		this.setUseSoftDelete(relatedModel["$useSoftDelete"]);
		this.setUseTimestamps(relatedModel["$useTimestamps"]);
		this.setIsDeleted(relatedModel["$isDeleted"]);
	}

	public firstOrNew(
		filter: Partial<IQueryBuilderFormSchema<M>>,
		doc?: Partial<IQueryBuilderFormSchema<M>>,
		options?: InsertOneOptions,
	): Promise<M> {
		const _filter = {
			...filter,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;
		return super.firstOrNew(_filter, doc, options);
	}

	public firstOrCreate(
		filter: Partial<IQueryBuilderFormSchema<M>>,
		doc?: Partial<IQueryBuilderFormSchema<M>>,
		options?: InsertOneOptions,
	): Promise<M> {
		const _filter = {
			...filter,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;
		return super.firstOrCreate(_filter, doc, options);
	}

	public updateOrCreate(
		filter: Partial<IQueryBuilderFormSchema<M>>,
		doc: Partial<IQueryBuilderFormSchema<M>>,
		options?: InsertOneOptions,
	) {
		const _filter = {
			...filter,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;
		return super.updateOrCreate(_filter, doc, options);
	}

	// @ts-ignore
	public save(doc: Partial<M>, options?: InsertOneOptions): Promise<M> {
		const data = {
			...doc,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;

		return this.insert(data, options);
	}

	public saveMany(docs: Partial<M>[], options?: BulkWriteOptions) {
		const data = docs.map((doc) => ({
			...doc,
			[this.foreignKey]: this.model["$original"][this.localKey],
		})) as IQueryBuilderFormSchema<M>[];

		return this.insertMany(data, options);
	}

	// @ts-ignore
	public create(doc: Partial<M>, options?: InsertOneOptions): Promise<M> {
		return this.save(doc, options);
	}

	// @ts-ignore
	public createMany(docs: Partial<M>[], options?: BulkWriteOptions) {
		return this.saveMany(docs, options);
	}

	public all(): Promise<Collection<M>> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.all();
	}

	public get<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Collection<Pick<M, K>>> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.get(...fields);
	}

	public paginate(
		page: number = 1,
		limit: number = 15,
	): Promise<IQueryBuilderPaginated> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.paginate(page, limit);
	}

	public first<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Pick<M, K> | null> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.first(...fields);
	}

	public count(): Promise<number> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.count();
	}

	public sum<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.sum(field);
	}

	public min<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.min(field);
	}

	public max<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.max(field);
	}

	public avg<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.avg(field);
	}

	public static generate(hasMany: IRelationshipHasMany): Document[] {
		const lookup = this.lookup(hasMany);

		if (hasMany.options?.select) {
			const select = LookupBuilder.select(
				hasMany.options.select,
				hasMany.alias,
			);
			lookup.push(...select);
		}

		if (hasMany.options?.exclude) {
			const exclude = LookupBuilder.exclude(
				hasMany.options.exclude,
				hasMany.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	public static lookup(hasMany: IRelationshipHasMany): Document[] {
		const lookup: Document[] = [];
		const pipeline: Document[] = [];

		if (hasMany.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [{ $eq: [`$${hasMany.relatedModel.getIsDeleted()}`, false] }],
					},
				},
			});
		}

		if (hasMany.options?.sort) {
			const sort = LookupBuilder.sort(
				hasMany.options?.sort[0],
				hasMany.options?.sort[1],
			);
			pipeline.push(sort);
		}

		if (hasMany.options?.skip) {
			const skip = LookupBuilder.skip(hasMany.options?.skip);
			pipeline.push(skip);
		}

		if (hasMany.options?.limit) {
			const limit = LookupBuilder.limit(hasMany.options?.limit);
			pipeline.push(limit);
		}

		hasMany.model["$nested"].forEach((el) => {
			if (typeof hasMany.relatedModel[el] === "function") {
				hasMany.relatedModel.setAlias(el);
				const nested = hasMany.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		const $lookup = {
			from: hasMany.relatedModel.getCollection(),
			localField: hasMany.localKey,
			foreignField: hasMany.foreignKey,
			as: hasMany.alias || "alias",
			pipeline: pipeline,
		};

		lookup.push({ $lookup });

		lookup.push({
			$project: {
				alias: 0,
			},
		});

		return lookup;
	}
}

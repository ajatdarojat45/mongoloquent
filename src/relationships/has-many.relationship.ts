import { Document } from "mongodb";
import { Collection, Model, QueryBuilder } from "../core";
import {
	IQueryBuilderFormSchema,
	IQueryBuilderPaginated,
	IRelationshipHasMany,
} from "../types";
import { LookupBuilder } from "./index";

export class HasMany<T, M> extends QueryBuilder<M> {
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
		this.$connection = relatedModel["$connection"];
		this.$collection = relatedModel["$collection"];
		this.$useSoftDelete = relatedModel["$useSoftDelete"];
		this.$databaseName = relatedModel["$databaseName"];
		this.$useSoftDelete = relatedModel["$useSoftDelete"];
		this.$useTimestamps = relatedModel["$useTimestamps"];
		this.setIsDeleted(relatedModel["$isDeleted"]);
	}

	public firstOrNew(
		filter: Partial<IQueryBuilderFormSchema<M>>,
		doc?: Partial<IQueryBuilderFormSchema<M>>,
	) {
		const _filter = {
			...filter,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;
		return super.firstOrNew(_filter, doc);
	}

	public firstOrCreate(
		filter: Partial<IQueryBuilderFormSchema<M>>,
		doc?: Partial<IQueryBuilderFormSchema<M>>,
	) {
		const _filter = {
			...filter,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;
		return super.firstOrCreate(_filter, doc);
	}

	public updateOrCreate(
		filter: Partial<IQueryBuilderFormSchema<M>>,
		doc: Partial<IQueryBuilderFormSchema<M>>,
	) {
		const _filter = {
			...filter,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;
		return super.updateOrCreate(_filter, doc);
	}

	// @ts-ignore
	public save(doc: Partial<M>) {
		const data = {
			...doc,
			[this.foreignKey]: this.model["$original"][this.localKey],
		} as IQueryBuilderFormSchema<M>;

		return this.insert(data);
	}

	public saveMany(docs: Partial<M>[]) {
		const data = docs.map((doc) => ({
			...doc,
			[this.foreignKey]: this.model["$original"][this.localKey],
		})) as IQueryBuilderFormSchema<M>[];

		return this.insertMany(data);
	}

	// @ts-ignore
	public create(doc: Partial<M>) {
		return this.save(doc);
	}

	// @ts-ignore
	public createMany(docs: Partial<M>[]) {
		return this.saveMany(docs);
	}

	public all(): Promise<Collection<M>> {
		this.where(this.foreignKey, this.model["$original"][this.localKey]);
		return super.all();
	}

	public get<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	) {
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
	) {
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

		if (hasMany.relatedModel["$useSoftDelete"]) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [{ $eq: [`$${hasMany.relatedModel["$isDeleted"]}`, false] }],
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
				hasMany.relatedModel["$alias"] = el;
				const nested = hasMany.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		const $lookup = {
			from: hasMany.relatedModel["$collection"],
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

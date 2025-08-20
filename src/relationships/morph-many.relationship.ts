import {
	Collection,
	IQueryBuilderFormSchema,
	IQueryBuilderPaginated,
	IRelationshipMorphMany,
	LookupBuilder,
	Model,
	QueryBuilder,
} from "../index";
import {
	BulkWriteOptions,
	Document,
	InsertOneOptions,
	ObjectId,
	WithId,
} from "mongodb";

export class MorphMany<T = any, M = any> extends QueryBuilder<M> {
	model: Model<T>;
	relatedModel: Model<M>;
	morph: string;
	morphId: string;
	morphType: string;

	constructor(model: Model<T>, relatedModel: Model<M>, morph: string) {
		super();
		this.model = model;
		this.relatedModel = relatedModel;
		this.morph = morph;
		this.morphId = `${morph}Id`;
		this.morphType = `${morph}Type`;

		this.setConnection(model["$connection"]);
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
			[this.morphType]: this.model.constructor.name,
			[this.morphId]: (this.model["$original"] as any)["_id"],
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
			[this.morphType]: this.model.constructor.name,
			[this.morphId]: (this.model["$original"] as any)["_id"],
		} as IQueryBuilderFormSchema<M>;

		return super.firstOrCreate(_filter, doc, options);
	}

	public updateOrCreate(
		filter: Partial<IQueryBuilderFormSchema<M>>,
		doc?: Partial<IQueryBuilderFormSchema<M>>,
		options?: InsertOneOptions,
	): Promise<M | WithId<IQueryBuilderFormSchema<M>>> {
		const _filter = {
			...filter,
			[this.morphType]: this.model.constructor.name,
			[this.morphId]: (this.model["$original"] as any)["_id"],
		} as IQueryBuilderFormSchema<M>;

		return super.updateOrCreate(_filter, doc, options);
	}

	// @ts-ignore
	public save(
		doc: Partial<IQueryBuilderFormSchema<M>>,
		options?: InsertOneOptions,
	): Promise<M> {
		const data = {
			...doc,
			[this.morphType]: this.model.constructor.name,
			[this.morphId]: (this.model["$original"] as any)["_id"],
		} as IQueryBuilderFormSchema<M>;

		return this.insert(data, options);
	}

	public saveMany(
		docs: Partial<IQueryBuilderFormSchema<M>>[],
		options?: BulkWriteOptions,
	): Promise<ObjectId[]> {
		const data = docs.map((doc) => ({
			...doc,
			[this.morphType]: this.model.constructor.name,
			[this.morphId]: (this.model["$original"] as any)["_id"],
		})) as IQueryBuilderFormSchema<M>[];

		return this.insertMany(data, options);
	}

	// @ts-ignore
	public create(
		doc: Partial<IQueryBuilderFormSchema<M>>,
		options?: InsertOneOptions,
	): Promise<M> {
		return this.save(doc, options);
	}

	// @ts-ignore
	public createMany(
		docs: Partial<IQueryBuilderFormSchema<M>>[],
		options?: BulkWriteOptions,
	): Promise<ObjectId[]> {
		return this.saveMany(docs, options);
	}

	public all(): Promise<Collection<M>> {
		return super.all();
	}

	public async get<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Collection<Pick<M, K>>> {
		await this.setDefaultCondition();
		return super.get(...fields);
	}

	public async paginate(
		page: number = 1,
		limit: number = 15,
	): Promise<IQueryBuilderPaginated> {
		await this.setDefaultCondition();

		return super.paginate(page, limit);
	}

	public first<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Pick<M, K> | null> {
		return super.first(...fields);
	}

	public async count(): Promise<number> {
		await this.setDefaultCondition();
		return super.count();
	}

	public async sum<K extends keyof M>(
		field: K | (string & {}),
	): Promise<number> {
		await this.setDefaultCondition();
		return super.sum(field);
	}

	public async min<K extends keyof M>(
		field: K | (string & {}),
	): Promise<number> {
		await this.setDefaultCondition();
		return super.min(field);
	}

	public async max<K extends keyof M>(
		field: K | (string & {}),
	): Promise<number> {
		await this.setDefaultCondition();
		return super.max(field);
	}

	public async avg<K extends keyof M>(
		field: K | (string & {}),
	): Promise<number> {
		await this.setDefaultCondition();
		return super.avg(field);
	}

	private async setDefaultCondition() {
		this.where(this.morphType as keyof M, this.model.constructor.name).where(
			this.morphId as keyof M,
			(this.model["$original"] as any)["_id"],
		);
	}

	static generate(morphMany: IRelationshipMorphMany): Document[] {
		const lookup = this.lookup(morphMany);
		let hidden = morphMany.relatedModel.getHidden();

		if (morphMany.options?.select) {
			const select = LookupBuilder.select(
				morphMany.options.select,
				morphMany.alias,
			);
			lookup.push(...select);
		}

		if (morphMany.options?.exclude) {
			hidden.push(...morphMany.options.exclude);
		}

		if (morphMany.options.makeVisible) {
			hidden = hidden.filter(
				(el) => !morphMany.options.makeVisible?.includes(el as string),
			);
		}

		if (hidden.length > 0) {
			const exclude = LookupBuilder.exclude(
				hidden as string[],
				morphMany.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	static lookup(morphMany: IRelationshipMorphMany): Document[] {
		const lookup: Document[] = [{ $project: { alias: 0 } }];
		const pipeline: Document[] = [];
		const alias = morphMany.alias || "alias";

		if (morphMany.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [
							{ $eq: [`$${morphMany.relatedModel.getIsDeleted()}`, false] },
							{
								$eq: [
									`$${morphMany.morphType}`,
									morphMany.model.constructor.name,
								],
							},
						],
					},
				},
			});
		} else {
			pipeline.push({
				$match: {
					$expr: {
						$and: [
							{
								$eq: [
									`$${morphMany.morphType}`,
									morphMany.model.constructor.name,
								],
							},
						],
					},
				},
			});
		}

		if (morphMany.options?.sort) {
			const sort = LookupBuilder.sort(
				morphMany.options?.sort[0],
				morphMany.options?.sort[1],
			);
			pipeline.push(sort);
		}

		if (morphMany.options?.skip) {
			const skip = LookupBuilder.skip(morphMany.options?.skip);
			pipeline.push(skip);
		}

		if (morphMany.options?.limit) {
			const limit = LookupBuilder.limit(morphMany.options?.limit);
			pipeline.push(limit);
		}

		morphMany.model.getNested().forEach((el) => {
			if (typeof morphMany.relatedModel[el] === "function") {
				morphMany.relatedModel.setAlias(el);
				const nested = morphMany.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		const $lookup = {
			from: morphMany.relatedModel.getCollection(),
			localField: "_id",
			foreignField: morphMany.morphId,
			as: alias,
			pipeline: pipeline,
		};

		lookup.push({ $lookup });
		return lookup;
	}
}

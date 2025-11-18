import {
	IQueryBuilderPaginated,
	IRelationshipHasManyThrough,
	Collection,
	Model,
	QueryBuilder,
	LookupBuilder,
} from "../index";
import { Document } from "mongodb";

export class HasManyThrough<
	T = any,
	M = any,
	TM = any,
> extends QueryBuilder<M> {
	model: Model<T>;
	relatedModel: Model<M>;
	throughModel: Model<TM>;
	foreignKey: keyof TM;
	foreignKeyThrough: keyof M;
	localKey: keyof T;
	localKeyThrough: keyof TM;

	constructor(
		model: Model<T>,
		relatedModel: Model<M>,
		throughModel: Model<TM>,
		foreignKey: keyof TM,
		foreignKeyThrough: keyof M,
		localKey: keyof T,
		localKeyThrough: keyof TM,
	) {
		super();
		this.model = model;
		this.relatedModel = relatedModel;
		this.throughModel = throughModel;
		this.foreignKey = foreignKey;
		this.foreignKeyThrough = foreignKeyThrough;
		this.localKey = localKey;
		this.localKeyThrough = localKeyThrough;
		this.setConnection(relatedModel["$connection"]);
		this.setCollection(relatedModel["$collection"]);
		this.setDatabaseName(relatedModel["$databaseName"]);
		this.setUseSoftDelete(relatedModel["$useSoftDelete"]);
		this.setIsDeleted(relatedModel["$isDeleted"]);
		this.setUseTimestamps(relatedModel["$useTimestamps"]);
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
	): Promise<IQueryBuilderPaginated<Collection<M>>> {
		await this.setDefaultCondition();
		return super.paginate(page, limit);
	}

	public async first<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Pick<M, K> | null> {
		await this.setDefaultCondition();
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
		const hmtIds = await this.throughModel
			.withTrashed()
			.where(this.foreignKey, this.model["$original"][this.localKey])
			.pluck(this.localKeyThrough);

		this.whereIn(this.foreignKeyThrough, hmtIds);
	}

	static generate<T>(hasManyThrough: IRelationshipHasManyThrough<T>): Document[] {
		const lookup = this.lookup<T>(hasManyThrough);
		let hidden = hasManyThrough.relatedModel.getHidden();

		if (hasManyThrough.options?.select) {
			const select = LookupBuilder.select<T>(
				hasManyThrough.options.select,
				hasManyThrough.alias,
			);
			lookup.push(...select);
		}

		if (hasManyThrough.options?.exclude) {
			const excludeArray = Array.isArray(hasManyThrough.options.exclude)
				? hasManyThrough.options.exclude
				: [hasManyThrough.options.exclude];
			hidden.push(...excludeArray);
		}

		if (hasManyThrough.options.makeVisible) {
			const makeVisibleArray = Array.isArray(hasManyThrough.options.makeVisible)
				? hasManyThrough.options.makeVisible
				: [hasManyThrough.options.makeVisible];

			hidden = hidden.filter(
				(el) => !makeVisibleArray.map(v => String(v)).includes(String(el)),
			);
    }

		if (hidden.length > 0) {
			const exclude = LookupBuilder.exclude<T>(
				hidden,
				hasManyThrough.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	static lookup<T>(hasManyThrough: IRelationshipHasManyThrough<T>): Document[] {
		const lookup: Document[] = [];
		const pipeline: Document[] = [];

		if (hasManyThrough.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [
							{
								$eq: [`$${hasManyThrough.relatedModel.getIsDeleted()}`, false],
							},
						],
					},
				},
			});
		}

		if (hasManyThrough.options?.sort) {
			const sort = LookupBuilder.sort(
				hasManyThrough.options?.sort[0],
				hasManyThrough.options?.sort[1],
			);
			pipeline.push(sort);
		}

		if (hasManyThrough.options?.skip) {
			const skip = LookupBuilder.skip(hasManyThrough.options?.skip);
			lookup.push(skip);
		}

		if (hasManyThrough.options?.limit) {
			const limit = LookupBuilder.limit(hasManyThrough.options?.limit);
			pipeline.push(limit);
		}

		hasManyThrough.model.getNested().forEach((el) => {
			if (typeof hasManyThrough.relatedModel[el] === "function") {
				hasManyThrough.relatedModel.setAlias(el);
				const nested = hasManyThrough.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		lookup.push(
			{
				$lookup: {
					from: hasManyThrough.throughModel.getCollection(),
					localField: hasManyThrough.localKey,
					foreignField: hasManyThrough.foreignKey,
					as: "pivot",
				},
			},
			{
				$lookup: {
					from: hasManyThrough.relatedModel.getCollection(),
					localField: `pivot.${hasManyThrough.localKeyThrough}`,
					foreignField: `${hasManyThrough.foreignKeyThrough}`,
					as: hasManyThrough.alias || "alias",
					pipeline,
				},
			},
			{
				$project: {
					pivot: 0,
					alias: 0,
				},
			},
		);

		return lookup;
	}
}

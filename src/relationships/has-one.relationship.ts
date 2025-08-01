import { Document } from "mongodb";
import {
	IQueryBuilderPaginated,
	IRelationshipHasOne,
	Collection,
	Model,
	QueryBuilder,
	LookupBuilder,
} from "../index";

export class HasOne<T = any, M = any> extends QueryBuilder<M> {
	model: Model<T>;
	relatedModel: Model<M>;
	foreignKey: keyof M;
	localKey: keyof T;

	constructor(
		model: Model<T>,
		relatedModel: Model<M>,
		foreignKey: keyof M,
		localKey: keyof T,
	) {
		super();
		this.model = model;
		this.relatedModel = relatedModel;
		this.foreignKey = foreignKey;
		this.localKey = localKey;

		this.setConnection(relatedModel["$connection"]);
		this.setCollection(relatedModel["$collection"]);
		this.setDatabaseName(relatedModel["$databaseName"]);
		this.setUseSoftDelete(relatedModel["$useSoftDelete"]);
		this.setUseTimestamps(relatedModel["$useTimestamps"]);
		this.setIsDeleted(relatedModel["$isDeleted"]);
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

	static generate(hasOne: IRelationshipHasOne): Document[] {
		const lookup = this.lookup(hasOne);

		if (hasOne.options?.select) {
			const select = LookupBuilder.select(hasOne.options.select, hasOne.alias);
			lookup.push(...select);
		}

		if (hasOne.options?.exclude) {
			const exclude = LookupBuilder.exclude(
				hasOne.options.exclude,
				hasOne.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	static lookup(hasOne: IRelationshipHasOne): Document[] {
		const lookup: Document[] = [];
		const pipeline: Document[] = [];

		if (hasOne.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [{ $eq: [`$${hasOne.relatedModel.getIsDeleted()}`, false] }],
					},
				},
			});
		}

		const $lookup = {
			from: hasOne.relatedModel.getCollection(),
			localField: hasOne.localKey,
			foreignField: hasOne.foreignKey,
			as: hasOne.alias,
			pipeline: pipeline,
		};

		lookup.push({ $lookup });

		lookup.push({
			$unwind: {
				path: `$${hasOne.alias}`,
				preserveNullAndEmptyArrays: true,
			},
		});

		return lookup;
	}
}

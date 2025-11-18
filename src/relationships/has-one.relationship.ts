import {
	IQueryBuilderPaginated,
	IRelationshipHasOne,
	Collection,
	Model,
	QueryBuilder,
	LookupBuilder,
} from "../index";
import { Document } from "mongodb";

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
	): Promise<IQueryBuilderPaginated<Collection<M>>> {
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

	static generate<T>(hasOne: IRelationshipHasOne<T>): Document[] {
		const lookup = this.lookup<T>(hasOne);
		let hidden = hasOne.relatedModel.getHidden();

		if (hasOne.options?.select) {
			const select = LookupBuilder.select<T>(hasOne.options.select, hasOne.alias);
			lookup.push(...select);
		}

		if (hasOne.options?.exclude) {
			const excludeArray = Array.isArray(hasOne.options.exclude)
				? hasOne.options.exclude
				: [hasOne.options.exclude];
			hidden.push(...excludeArray);
		}

		if (hasOne.options.makeVisible) {
			const makeVisibleArray = Array.isArray(hasOne.options.makeVisible)
				? hasOne.options.makeVisible
				: [hasOne.options.makeVisible];

			hidden = hidden.filter(
				(el) => !makeVisibleArray.map(v => String(v)).includes(String(el)),
			);
    }

		if (hidden.length > 0) {
			const exclude = LookupBuilder.exclude<T>(hidden, hasOne.alias);
			lookup.push(...exclude);
		}
		return lookup;
	}

	static lookup<T>(hasOne: IRelationshipHasOne<T>): Document[] {
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

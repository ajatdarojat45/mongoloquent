import {
	IQueryBuilderPaginated,
	IRelationshipBelongsTo,
	Collection,
	Model,
	QueryBuilder,
	LookupBuilder,
} from "../index";
import { Document } from "mongodb";

export class BelongsTo<T = any, M = any> extends QueryBuilder<M> {
	private model: Model<T>;
	private relatedModel: Model<M>;
	private foreignKey: keyof T;
	private ownerKey: keyof M;

	constructor(
		model: Model<T>,
		relatedModel: Model<M>,
		foreignKey: keyof T,
		ownerKey: keyof M,
	) {
		super();
		this.model = model;
		this.relatedModel = relatedModel;
		this.ownerKey = ownerKey;
		this.foreignKey = foreignKey;

		this.setConnection(relatedModel["$connection"]);
		this.setCollection(relatedModel["$collection"]);
		this.setDatabaseName(relatedModel["$databaseName"]);
		this.setUseSoftDelete(relatedModel["$useSoftDelete"]);
		this.setUseTimestamps(relatedModel["$useTimestamps"]);
		this.setIsDeleted(relatedModel["$isDeleted"]);
	}

	public all(): Promise<Collection<M>> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.all();
	}

	public get<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Collection<Pick<M, K>>> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.get(...fields);
	}

	public paginate(
		page: number = 1,
		limit: number = 15,
	): Promise<IQueryBuilderPaginated<Collection<M>>> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.paginate(page, limit);
	}

	public first<K extends keyof M>(
		...fields: (K | (string & {}) | (K | (string & {}))[])[]
	): Promise<Pick<M, K> | null> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.first(...fields);
	}

	public count(): Promise<number> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.count();
	}

	public sum<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.sum(field);
	}

	public min<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.min(field);
	}

	public max<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.max(field);
	}

	public avg<K extends keyof M>(field: K | (string & {})): Promise<number> {
		this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
		return super.avg(field);
	}

	public associate(model: QueryBuilder<M>) {
		this.model[this.foreignKey as any] = model["$original"][this.ownerKey];
		return this.model;
	}

	public dissociate() {
		this.model[this.foreignKey as any] = null;
		return this.model;
	}

	public disassociate() {
		this.model[this.foreignKey as any] = null;
		return this.model;
	}

	public static generate<T>(belongsTo: IRelationshipBelongsTo<T>): Document[] {
		const lookup = this.lookup<T>(belongsTo);
		let hidden = belongsTo.relatedModel.getHidden();

		if (belongsTo.options?.select) {
			const select = LookupBuilder.select<T>(
				belongsTo.options.select,
				belongsTo.alias,
			);
			lookup.push(...select);
		}

		if (belongsTo.options?.exclude) {
			const excludeArray = Array.isArray(belongsTo.options.exclude)
				? belongsTo.options.exclude
				: [belongsTo.options.exclude];
			hidden.push(...excludeArray);
		}

		if (belongsTo.options.makeVisible) {
			const makeVisibleArray = Array.isArray(belongsTo.options.makeVisible)
				? belongsTo.options.makeVisible
				: [belongsTo.options.makeVisible];

			hidden = hidden.filter(
				(el) => !makeVisibleArray.map(v => String(v)).includes(String(el)),
			);
    }

		if (hidden.length > 0) {
			const exclude = LookupBuilder.exclude<T>(
				hidden,
				belongsTo.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	static lookup<T>(belongsTo: IRelationshipBelongsTo<T>): Document[] {
		const lookup: Document[] = [];
		const pipeline: Document[] = [];

		if (belongsTo.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [
							{ $eq: [`$${belongsTo.relatedModel.getIsDeleted()}`, false] },
						],
					},
				},
			});
		}

		belongsTo.model.getNested().forEach((el) => {
			if (typeof belongsTo.relatedModel[el] === "function") {
				belongsTo.relatedModel.setAlias(el);
				const nested = belongsTo.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		const $lookup = {
			from: belongsTo.relatedModel.getCollection(),
			localField: belongsTo.foreignKey,
			foreignField: belongsTo.ownerKey,
			as: belongsTo.alias,
			pipeline: pipeline,
		};

		lookup.push({
			$lookup,
		});

		const _unwind = {
			$unwind: {
				path: `$${belongsTo.alias}`,
				preserveNullAndEmptyArrays: true,
			},
		};

		lookup.push(_unwind);

		return lookup;
	}
}

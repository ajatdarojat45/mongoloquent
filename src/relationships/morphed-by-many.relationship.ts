import {
	Collection,
	Model,
	QueryBuilder,
	IQueryBuilderPaginated,
	IRelationshipMorphedByMany,
} from "../index";
import { LookupBuilder } from "./lookup-builder.relationship";
import { Document, ObjectId } from "mongodb";

export class MorphedByMany<T = any, M = any> extends QueryBuilder<M> {
	model: Model<T>;
	relatedModel: Model<M>;
	morph: string;
	morphId: string;
	morphType: string;
	morphCollectionName: string;

	constructor(model: Model<T>, relatedModel: Model<M>, morph: string) {
		super();
		this.model = model;
		this.relatedModel = relatedModel;
		this.morph = morph;
		this.morphId = `${morph}Id`;
		this.morphType = `${morph}Type`;
		this.morphCollectionName = `${morph}s`;

		this.setConnection(relatedModel["$connection"]);
		this.setCollection(relatedModel["$collection"]);
		this.setDatabaseName(relatedModel["$databaseName"]);
		this.setUseSoftDelete(relatedModel["$useSoftDelete"]);
		this.setUseTimestamps(relatedModel["$useTimestamps"]);
		this.setIsDeleted(relatedModel["$isDeleted"]);
	}

	public async all(): Promise<Collection<M>> {
		await this.setDefaultCondition();
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
		const mbmColl = this.getMongoDBCollection(this.morphCollectionName);

		const mbmIds = await mbmColl
			.find({
				[this.morphType]: this.relatedModel.constructor.name,
				[`${this.model.constructor.name.toLowerCase()}Id`]: this.model.getId(),
			} as any)
			.map((el) => el[this.morphId as keyof typeof el] as unknown as ObjectId)
			.toArray();

		this.whereIn("_id" as keyof M, mbmIds);
	}

	static generate<T>(morphedByMany: IRelationshipMorphedByMany<T>): Document[] {
		const lookup = this.lookup<T>(morphedByMany);
		let hidden = morphedByMany.relatedModel.getHidden();

		if (morphedByMany.options?.select) {
			const select = LookupBuilder.select<T>(
				morphedByMany.options.select,
				morphedByMany.alias,
			);
			lookup.push(...select);
		}

		if (morphedByMany.options?.exclude) {
			const excludeArray = Array.isArray(morphedByMany.options.exclude)
				? morphedByMany.options.exclude
				: [morphedByMany.options.exclude];
			hidden.push(...excludeArray);
		}

		if (morphedByMany.options.makeVisible) {
			const makeVisibleArray = Array.isArray(morphedByMany.options.makeVisible)
				? morphedByMany.options.makeVisible
				: [morphedByMany.options.makeVisible];

			hidden = hidden.filter(
				(el) => !makeVisibleArray.map(v => String(v)).includes(String(el)),
			);
    }

		if (hidden.length > 0) {
			const exclude = LookupBuilder.exclude<T>(
				hidden,
				morphedByMany.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	static lookup<T>(morphedByMany: IRelationshipMorphedByMany<T>): Document[] {
		const lookup: Document[] = [];
		const pipeline: Document[] = [];

		if (morphedByMany.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [
							{ $eq: [`$${morphedByMany.relatedModel.getIsDeleted()}`, false] },
						],
					},
				},
			});
		}

		if (morphedByMany.options?.sort) {
			const sort = LookupBuilder.sort<T>(
				morphedByMany.options?.sort[0],
				morphedByMany.options?.sort[1],
			);
			pipeline.push(sort);
		}

		if (morphedByMany.options?.skip) {
			const skip = LookupBuilder.skip(morphedByMany.options?.skip);
			pipeline.push(skip);
		}

		if (morphedByMany.options?.limit) {
			const limit = LookupBuilder.limit(morphedByMany.options?.limit);
			pipeline.push(limit);
		}

		morphedByMany.model.getNested().forEach((el) => {
			if (typeof morphedByMany.relatedModel[el] === "function") {
				morphedByMany.relatedModel["$alias"] = el;
				const nested = morphedByMany.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		lookup.push(
			{
				$lookup: {
					from: morphedByMany.morphCollectionName,
					localField: "_id",
					foreignField: `${morphedByMany.model.constructor.name.toLowerCase()}Id`,
					as: "pivot",
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												`$${morphedByMany.morphType}`,
												morphedByMany.relatedModel.constructor.name,
											],
										},
									],
								},
							},
						},
					],
				},
			},
			{
				$lookup: {
					from: morphedByMany.relatedModel.getCollection(),
					localField: `pivot.${morphedByMany.morphId}`,
					foreignField: "_id",
					as: morphedByMany.alias || "alias",
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

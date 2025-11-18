import {
	Collection,
	Model,
	QueryBuilder,
	IQueryBuilderPaginated,
	IRelationshipMorphToMany,
} from "../index";
import { LookupBuilder } from "./lookup-builder.relationship";
import { Document, ObjectId } from "mongodb";

export class MorphToMany<T = any, M = any> extends QueryBuilder<M> {
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

		this.setConnection(model["$connection"]);
		this.setCollection(relatedModel["$collection"]);
		this.setDatabaseName(relatedModel["$databaseName"]);
		this.setUseSoftDelete(relatedModel["$useSoftDelete"]);
		this.setUseTimestamps(relatedModel["$useTimestamps"]);
		this.setIsDeleted(relatedModel["$isDeleted"]);
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

	public async attach<D>(
		ids: string | ObjectId | (string | ObjectId)[],
		doc?: Partial<D>,
	) {
		let objectIds: ObjectId[] = [];
		let query = {};
		const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

		if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
		else objectIds = ids.map((el) => new ObjectId(el));

		const collection = this.getMongoDBCollection(
			this.morphCollectionName as string,
		);
		const _payload: object[] = [];

		query = {
			[foreignKey]: { $in: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		objectIds.forEach((id) =>
			_payload.push({
				[foreignKey]: id,
				[this.morphId]: this.model.getId(),
				[this.morphType]: this.model.constructor.name,
				...doc,
			}),
		);

		const existingData = await collection.find(query).toArray();

		const payloadToInsert: object[] = [];
		const idsToUpdate: ObjectId[] = [];

		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find((item: any) => {
				return (
					JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i])
				);
			});

			if (!existingItem) payloadToInsert.push(_payload[i]);
		}

		if (payloadToInsert.length > 0)
			await collection.insertMany(payloadToInsert as any);

		return {
			message: "Attach successfully",
		};
	}

	public async detach(ids: string | ObjectId | (string | ObjectId)[]) {
		let objectIds: ObjectId[] = [];
		let isDeleteAll = false;
		const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

		if (!Array.isArray(ids)) {
			objectIds = ids ? [new ObjectId(ids)] : [];
			isDeleteAll = !ids && true;
		} else objectIds = ids.map((el) => new ObjectId(el));

		const collection = this.getMongoDBCollection(this.morphCollectionName);
		const query = {
			[foreignKey]: { $in: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		isDeleteAll && delete query[foreignKey];
		await collection.deleteMany(query as any);

		return {
			message: "Detach successfully",
		};
	}

	public async sync<D>(
		ids: string | ObjectId | (string | ObjectId)[],
		doc?: Partial<D>,
	) {
		let objectIds: ObjectId[] = [];
		const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

		if (!Array.isArray(ids)) {
			objectIds = [new ObjectId(ids)];
		} else {
			objectIds = ids.map((el) => new ObjectId(el));
		}

		const collection = this.getMongoDBCollection(this.morphCollectionName);
		const _payload: object[] = [];
		let qFind = {};
		let qDelete = {};

		qFind = {
			[foreignKey]: { $in: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		qDelete = {
			[foreignKey]: { $nin: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		objectIds.forEach((id) =>
			_payload.push({
				[foreignKey]: id,
				[this.morphId]: this.model.getId(),
				[this.morphType]: this.model.constructor.name,
				...doc,
			}),
		);

		const existingData = await collection.find(qFind).toArray();
		const payloadToInsert: object[] = [];
		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
			);
			if (!existingItem) payloadToInsert.push(_payload[i]);
		}

		if (payloadToInsert.length > 0)
			await collection.insertMany(payloadToInsert as any);

		await collection.deleteMany(qDelete);
		return {
			message: "Sync successfully",
		};
	}

	public async syncWithoutDetaching<D>(
		ids: string | ObjectId | (string | ObjectId)[],
		doc?: Partial<D>,
	) {
		let objectIds: ObjectId[] = [];
		const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

		if (!Array.isArray(ids)) {
			objectIds = [new ObjectId(ids)];
		} else {
			objectIds = ids.map((el) => new ObjectId(el));
		}

		const collection = this.getMongoDBCollection(this.morphCollectionName);
		const _payload: object[] = [];
		let qFind = {};
		let qDelete = {};
		let key = "";

		qFind = {
			[foreignKey]: { $in: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		qDelete = {
			[foreignKey]: { $nin: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		objectIds.forEach((id) =>
			_payload.push({
				[foreignKey]: id,
				[this.morphId]: this.model.getId(),
				[this.morphType]: this.model.constructor.name,
				...doc,
			}),
		);

		const existingData = await collection.find(qFind).toArray();
		const payloadToInsert: object[] = [];
		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
			);

			if (!existingItem) payloadToInsert.push(_payload[i]);
		}

		if (payloadToInsert.length > 0)
			await collection.insertMany(payloadToInsert as any);

		return {
			message: "Sync successfully",
		};
	}

	public async syncWithPivotValue<D>(
		ids: string | ObjectId | (string | ObjectId)[],
		doc: Partial<D>,
	) {
		let objectIds: ObjectId[] = [];
		const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

		if (!Array.isArray(ids)) {
			objectIds = [new ObjectId(ids)];
		} else {
			objectIds = ids.map((el) => new ObjectId(el));
		}

		const collection = this.getMongoDBCollection(this.morphCollectionName);
		const _payload: object[] = [];
		let qFind = {};
		let qDelete = {};

		qFind = {
			[foreignKey]: { $in: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		qDelete = {
			[foreignKey]: { $nin: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		objectIds.forEach((id) =>
			_payload.push({
				[foreignKey]: id,
				[this.morphId]: this.model.getId(),
				[this.morphType]: this.model.constructor.name,
				...doc,
			}),
		);

		const existingData = await collection.find(qFind).toArray();
		const payloadToInsert: object[] = [];
		const idsToUpdate: ObjectId[] = [];

		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
			);

			if (!existingItem) payloadToInsert.push(_payload[i]);
			else idsToUpdate.push(objectIds[i]);
		}

		if (payloadToInsert.length > 0)
			await collection.insertMany(payloadToInsert as any);

		if (idsToUpdate.length > 0) {
			await collection.updateMany(
				{
					[foreignKey as any]: { $in: idsToUpdate as any },
				},
				{
					$set: doc as any,
				},
			);
		}

		await collection.deleteMany(qDelete);
		return {
			message: "Sync successfully",
		};
	}

	public async toggle(ids: string | ObjectId | (string | ObjectId)[]) {
		let objectIds: ObjectId[] = [];
		const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

		if (!Array.isArray(ids)) {
			objectIds = [new ObjectId(ids)];
		} else {
			objectIds = ids.map((el) => new ObjectId(el));
		}

		const collection = this.getMongoDBCollection(this.morphCollectionName);
		const _payload: object[] = [];
		let qFind = {};
		let qDelete = {};

		qFind = {
			[foreignKey]: { $in: objectIds },
			[this.morphId]: this.model.getId(),
			[this.morphType]: this.model.constructor.name,
		};

		objectIds.forEach((id) =>
			_payload.push({
				[foreignKey]: id,
				[this.morphId]: this.model.getId(),
				[this.morphType]: this.model.constructor.name,
			}),
		);

		const existingData = await collection.find(qFind).toArray();
		const payloadToInsert: object[] = [];
		const idsToDelete: ObjectId[] = [];
		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
			);

			if (!existingItem) payloadToInsert.push(_payload[i]);
			else idsToDelete.push(objectIds[i]);
		}

		if (payloadToInsert.length > 0)
			await collection.insertMany(payloadToInsert as any);

		if (idsToDelete.length > 0) {
			const qDelete = {
				[foreignKey]: { $in: idsToDelete },
				[this.morphId]: this.model.getId(),
				[this.morphType]: this.model.constructor.name,
			};

			await collection.deleteMany(qDelete as any);
		}

		return {
			message: "Toggle sync successfully",
		};
	}

	private async setDefaultCondition() {
		const mtmColl = this.getMongoDBCollection(this.morphCollectionName);
		const key = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

		const mtmIds = await mtmColl
			.find({
				[this.morphType]: this.model.constructor.name,
				[this.morphId]: (this.model["$original"] as any)["_id"],
			} as any)
			.map((el) => el[key as keyof typeof el])
			.toArray();

		this.whereIn("_id" as keyof M, mtmIds);
	}

	static generate<T>(morphToMany: IRelationshipMorphToMany<T>): Document[] {
		const lookup = this.lookup<T>(morphToMany);
		let hidden = morphToMany.relatedModel.getHidden();

		if (morphToMany.options?.select) {
			const select = LookupBuilder.select<T>(
				morphToMany.options.select,
				morphToMany.alias,
			);
			lookup.push(...select);
		}

		if (morphToMany.options?.exclude) {
			const excludeArray = Array.isArray(morphToMany.options.exclude)
				? morphToMany.options.exclude
				: [morphToMany.options.exclude];
			hidden.push(...excludeArray);
		}

		if (morphToMany.options.makeVisible) {
			const makeVisibleArray = Array.isArray(morphToMany.options.makeVisible)
				? morphToMany.options.makeVisible
				: [morphToMany.options.makeVisible];

			hidden = hidden.filter(
				(el) => !makeVisibleArray.map(v => String(v)).includes(String(el)),
			);
    }

		if (hidden.length > 0) {
			const exclude = LookupBuilder.exclude<T>(
				hidden,
				morphToMany.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	static lookup<T>(morphToMany: IRelationshipMorphToMany<T>): Document[] {
		const lookup: Document[] = [];
		const pipeline: Document[] = [];

		if (morphToMany.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [
							{ $eq: [`$${morphToMany.relatedModel.getIsDeleted()}`, false] },
						],
					},
				},
			});
		}

		if (morphToMany.options?.sort) {
			const sort = LookupBuilder.sort<T>(
				morphToMany.options?.sort[0],
				morphToMany.options?.sort[1],
			);
			pipeline.push(sort);
		}

		if (morphToMany.options?.skip) {
			const skip = LookupBuilder.skip(morphToMany.options?.skip);
			pipeline.push(skip);
		}

		if (morphToMany.options?.limit) {
			const limit = LookupBuilder.limit(morphToMany.options?.limit);
			pipeline.push(limit);
		}

		morphToMany.model["$nested"].forEach((el) => {
			if (typeof morphToMany.relatedModel[el] === "function") {
				morphToMany.relatedModel.setAlias(el);
				const nested = morphToMany.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		lookup.push(
			{
				$lookup: {
					from: morphToMany.morphCollectionName,
					localField: "_id",
					foreignField: morphToMany.morphId,
					as: "pivot",
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: [
												`$${morphToMany.morphType}`,
												morphToMany.model.constructor.name,
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
					from: morphToMany.relatedModel.getCollection(),
					localField: `pivot.${morphToMany.relatedModel.constructor.name.toLowerCase()}Id`,
					foreignField: "_id",
					as: morphToMany.alias || "alias",
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

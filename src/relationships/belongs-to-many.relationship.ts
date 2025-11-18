import {
	IQueryBuilderPaginated,
	IRelationshipBelongsToMany,
	Collection,
	Model,
	QueryBuilder,
	LookupBuilder,
} from "../index";
import {
	BulkWriteOptions,
	DeleteOptions,
	Document,
	ObjectId,
	UpdateOptions,
} from "mongodb";

export class BelongsToMany<T = any, M = any, PM = any> extends QueryBuilder<M> {
	private model: Model<T>;
	private relatedModel: Model<M>;
	private pivotModel: Model<PM>;
	private foreignPivotKey: keyof PM;
	private relatedPivotKey: keyof PM;
	private parentKey: keyof T;
	private relatedKey: keyof M;

	constructor(
		model: Model<T>,
		relatedModel: Model<M>,
		pivotModel: Model<PM>,
		foreignPivotKey: keyof PM,
		relatedPivotKey: keyof PM,
		parentKey: keyof T,
		relatedKey: keyof M,
	) {
		super();
		this.model = model;
		this.relatedModel = relatedModel;
		this.pivotModel = pivotModel;
		this.foreignPivotKey = foreignPivotKey;
		this.relatedPivotKey = relatedPivotKey;
		this.parentKey = parentKey;
		this.relatedKey = relatedKey;

		this.setConnection(relatedModel["$connection"]);
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
		options?: {
			options?: BulkWriteOptions;
			doc?: Partial<D>;
		},
	): Promise<{ message: string }> {
		let objectIds: ObjectId[] = [];
		let query: Document = {};
		const doc = options?.doc || {};
		const mongodbOptions = options?.options || {};

		if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
		else objectIds = ids.map((el) => new ObjectId(el));

		const payload: object[] = [];

		objectIds.forEach((id) =>
			payload.push({
				[this.relatedPivotKey]: id,
				[this.foreignPivotKey]: this.model["$original"][this.parentKey],
				...doc,
			}),
		);

		const existingData = await this.pivotModel
			.withTrashed()
			.whereIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.get();

		const payloadToInsert: object[] = [];
		const idsToUpdate: ObjectId[] = [];

		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find((item: any) => {
				return (
					JSON.stringify(item[this.relatedPivotKey]) ===
					JSON.stringify(objectIds[i])
				);
			});

			if (!existingItem) payloadToInsert.push(payload[i]);
			// @ts-ignore
			else if (existingItem?.[this.pivotModel.getIsDeleted()]) {
				// @ts-ignore
				idsToUpdate.push(existingItem._id);
			}
		}

		if (payloadToInsert.length > 0) {
			await this.pivotModel.insertMany(payloadToInsert as any, mongodbOptions);
		}

		if (idsToUpdate.length > 0) {
			await this.pivotModel
				.whereIn("_id" as keyof PM, idsToUpdate)
				.restore(mongodbOptions);
		}

		return {
			message: "Attach successfully",
		};
	}

	public async detach(
		ids: string | ObjectId | (string | ObjectId)[],
		options?: DeleteOptions | UpdateOptions,
	): Promise<{ message: string }> {
		let objectIds: ObjectId[] = [];

		if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
		else objectIds = ids.map((el) => new ObjectId(el));

		await this.pivotModel
			.whereIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.delete(options);

		return {
			message: "Detach successfully",
		};
	}

	public async sync<D>(
		ids: string | ObjectId | (string | ObjectId)[],
		options?: {
			doc?: Partial<D>;
			options?: BulkWriteOptions | UpdateOptions | DeleteOptions;
		},
	): Promise<{ message: string }> {
		let objectIds: ObjectId[] = [];
		const doc = options?.doc || {};
		const mongodbOptions = options?.options || {};

		if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
		else objectIds = ids.map((el) => new ObjectId(el));

		const _payload: object[] = [];

		objectIds.forEach((id) =>
			_payload.push({
				[this.foreignPivotKey]: this.model["$original"][this.parentKey],
				[this.relatedPivotKey]: id,
				...doc,
			}),
		);

		const existingData = await this.pivotModel
			.whereIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.get();

		const payloadToInsert: object[] = [];
		const idsToUpdate: ObjectId[] = [];

		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[this.relatedPivotKey]) ===
					JSON.stringify(objectIds[i]),
			);
			if (!existingItem) payloadToInsert.push(_payload[i]);
			// @ts-ignore
			else if (existingItem?.[this.pivotModel["$isDeleted"]])
				// @ts-ignore
				idsToUpdate.push(existingItem._id);
		}

		if (payloadToInsert.length > 0) {
			await this.pivotModel.insertMany(payloadToInsert as any, mongodbOptions);
		}

		if (idsToUpdate.length > 0) {
			await this.pivotModel
				.whereIn("_id" as keyof PM, idsToUpdate)
				.restore(mongodbOptions);
		}

		await this.pivotModel
			.whereNotIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.delete(mongodbOptions);

		return {
			message: "Sync successfully",
		};
	}

	public async syncWithoutDetaching<D>(
		ids: string | ObjectId | (string | ObjectId)[],
		options?: {
			doc?: Partial<D>;
			options?: BulkWriteOptions | DeleteOptions | UpdateOptions;
		},
	): Promise<{ message: string }> {
		let objectIds: ObjectId[] = [];
		const doc = options?.doc || {};
		const mongodbOptions = options?.options || {};

		if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
		else objectIds = ids.map((el) => new ObjectId(el));

		const _payload: object[] = [];

		objectIds.forEach((id) =>
			_payload.push({
				[this.foreignPivotKey]: this.model["$original"][this.parentKey],
				[this.relatedPivotKey]: id,
				...doc,
			}),
		);

		const existingData = await this.pivotModel
			.whereIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.get();

		const payloadToInsert: object[] = [];
		const idsToUpdate: ObjectId[] = [];

		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[this.relatedPivotKey]) ===
					JSON.stringify(objectIds[i]),
			);
			if (!existingItem) payloadToInsert.push(_payload[i]);
			// @ts-ignore
			else if (existingItem?.[this.pivotModel["$isDeleted"]])
				// @ts-ignore
				idsToUpdate.push(existingItem._id);
		}

		if (payloadToInsert.length > 0) {
			await this.pivotModel.insertMany(payloadToInsert as any, mongodbOptions);
		}

		if (idsToUpdate.length > 0) {
			await this.pivotModel
				.whereIn("_id" as keyof PM, idsToUpdate)
				.restore(mongodbOptions);
		}

		return {
			message: "Sync successfully",
		};
	}

	public async syncWithPivotValues<D>(
		ids: string | ObjectId | (string | ObjectId)[],
		options: {
			doc: Partial<D>;
			options?: BulkWriteOptions | DeleteOptions | UpdateOptions;
		},
	): Promise<{ message: string }> {
		let objectIds: ObjectId[] = [];
		const doc = options.doc || {};
		const mongodbOptions = options.options || {};

		if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
		else objectIds = ids.map((el) => new ObjectId(el));

		const _payload: object[] = [];

		objectIds.forEach((id) =>
			_payload.push({
				[this.foreignPivotKey]: this.model["$original"][this.parentKey],
				[this.relatedPivotKey]: id,
				...doc,
			}),
		);

		const existingData = await this.pivotModel
			.whereIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.get();

		const payloadToInsert: object[] = [];
		const idsToUpdate: ObjectId[] = [];

		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[this.relatedPivotKey]) ===
					JSON.stringify(objectIds[i]),
			);
			if (!existingItem) payloadToInsert.push(_payload[i]);
			else idsToUpdate.push(objectIds[i]);
		}

		if (payloadToInsert.length > 0) {
			await this.pivotModel.insertMany(payloadToInsert as any, mongodbOptions);
		}

		if (idsToUpdate.length > 0) {
			await this.pivotModel
				.whereIn(this.relatedPivotKey, idsToUpdate)
				.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
				.updateMany(doc as any, mongodbOptions);
		}

		await this.pivotModel
			.whereNotIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.delete(mongodbOptions);

		return {
			message: "syncWithPivotValues successfully",
		};
	}

	public async toggle(
		ids: string | ObjectId | (string | ObjectId)[],
		options?: UpdateOptions | DeleteOptions | BulkWriteOptions,
	): Promise<{ message: string }> {
		let objectIds: ObjectId[] = [];

		if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
		else objectIds = ids.map((el) => new ObjectId(el));

		const _payload: object[] = [];
		let qFind = {};

		qFind = {
			[this.relatedPivotKey]: {
				$in: objectIds,
			},
			[this.foreignPivotKey]: this.model["$original"][this.parentKey],
		};

		objectIds.forEach((id) =>
			_payload.push({
				[this.foreignPivotKey]: this.model["$original"][this.parentKey],
				[this.relatedPivotKey]: id,
			}),
		);

		const existingData = await this.pivotModel
			.withTrashed()
			.whereIn(this.relatedPivotKey, objectIds)
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.get();

		const payloadToInsert: object[] = [];
		const idsToDelete: any[] = [];
		const idsToRestore: ObjectId[] = [];

		for (let i = 0; i < objectIds.length; i++) {
			const existingItem = existingData.find(
				(item: any) =>
					JSON.stringify(item[this.relatedPivotKey]) ===
					JSON.stringify(objectIds[i]),
			);
			if (!existingItem) payloadToInsert.push(_payload[i]);
			// @ts-ignore
			else if (existingItem?.[this.pivotModel.getIsDeleted()])
				// @ts-ignore
				idsToRestore.push(existingItem._id);
			else
				idsToDelete.push(
					(_payload[i] as Record<keyof PM, any>)[this.relatedPivotKey],
				);
		}

		if (payloadToInsert.length > 0) {
			await this.pivotModel.insertMany(payloadToInsert as any, options);
		}

		if (idsToRestore.length > 0) {
			await this.pivotModel
				.whereIn("_id" as keyof PM, idsToRestore)
				.restore(options);
		}

		if (idsToDelete.length > 0) {
			await this.pivotModel
				.whereIn(this.relatedPivotKey, idsToDelete)
				.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
				.delete(options);
		}

		return {
			message: "toggle sync successfully",
		};
	}

	private async setDefaultCondition(): Promise<void> {
		const btmIds = await this.pivotModel
			.where(this.foreignPivotKey, this.model["$original"][this.parentKey])
			.pluck(this.relatedPivotKey);
		this.whereIn(this.relatedKey, btmIds);
	}

	static generate(belongsToMany: IRelationshipBelongsToMany): Document[] {
		const lookup = this.lookup(belongsToMany);
		let hidden = belongsToMany.relatedModel.getHidden();

		if (belongsToMany.options?.select) {
			const select = LookupBuilder.select(
				belongsToMany.options.select,
				belongsToMany.alias,
			);
			lookup.push(...select);
		}

		if (belongsToMany.options?.exclude) {
			hidden.push(...belongsToMany.options.exclude);
		}

		if (belongsToMany.options.makeVisible) {
			hidden = hidden.filter(
				(el) => !belongsToMany.options.makeVisible?.includes(el as string),
			);
		}

		if (hidden.length > 0) {
			const exclude = LookupBuilder.exclude(
				hidden as string[],
				belongsToMany.alias,
			);
			lookup.push(...exclude);
		}

		return lookup;
	}

	static lookup(belongsToMany: IRelationshipBelongsToMany): Document[] {
		const lookup: Document[] = [];
		const pipeline: Document[] = [];

		if (belongsToMany.relatedModel.getUseSoftDelete()) {
			pipeline.push({
				$match: {
					$expr: {
						$and: [
							{ $eq: [`$${belongsToMany.relatedModel.getIsDeleted()}`, false] },
						],
					},
				},
			});
		}

		if (belongsToMany.options?.sort) {
			const sort = LookupBuilder.sort(
				belongsToMany.options?.sort[0],
				belongsToMany.options?.sort[1],
			);
			pipeline.push(sort);
		}

		if (belongsToMany.options?.skip) {
			const skip = LookupBuilder.skip(belongsToMany.options?.skip);
			pipeline.push(skip);
		}

		if (belongsToMany.options?.limit) {
			const limit = LookupBuilder.limit(belongsToMany.options?.limit);
			pipeline.push(limit);
		}

		belongsToMany.model.getNested().forEach((el) => {
			if (typeof belongsToMany.relatedModel[el] === "function") {
				belongsToMany.relatedModel["$alias"] = el;
				const nested = belongsToMany.relatedModel[el]();
				pipeline.push(...nested.model.$lookups);
			}
		});

		lookup.push(
			{
				$lookup: {
					from: belongsToMany.pivotModel.getCollection(),
					localField: belongsToMany.parentKey,
					foreignField: belongsToMany.foreignPivotKey,
					as: "pivot",
				},
			},
			{
				$lookup: {
					from: belongsToMany.relatedModel.getCollection(),
					localField: `pivot.${belongsToMany.relatedPivotKey}`,
					foreignField: belongsToMany.relatedKey,
					as: belongsToMany.alias || "pivot",
					pipeline,
				},
			},
			{
				$project: {
					pivot: 0,
				},
			},
		);

		return lookup;
	}
}

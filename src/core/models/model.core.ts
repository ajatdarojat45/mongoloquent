import {
	BulkWriteOptions,
	FindOneAndUpdateOptions,
	InsertOneOptions,
	ObjectId,
} from "mongodb";

import {
	IQueryBuilderFormSchema,
	IRelationshipBelongsTo,
	IRelationshipBelongsToMany,
	IRelationshipHasMany,
	IRelationshipHasManyThrough,
	IRelationshipHasOne,
	IRelationshipOptions,
	IRelationshipTypes,
	HasOne,
	HasMany,
	HasManyThrough,
	BelongsTo,
	BelongsToMany,
	IRelationshipMorphMany,
	IRelationshipMorphTo,
	IRelationshipMorphToMany,
	IRelationshipMorphedByMany,
	MorphedByMany,
	MorphMany,
	MorphTo,
	MorphToMany,
} from "../../index";
import { QueryBuilder } from "../query-builders";

export class Model<T = any> extends QueryBuilder<T> {
	[key: string]: any;
	public static $schema: any;
	protected static $timezone: string;
	protected static $connection: string;
	protected static $databaseName: string;

	protected $with: string[] = [];
	protected $nested: string[] = [];
	private $without: string[] = [];
	private $withOnly: string[] = [];

	constructor() {
		super();
		return new Proxy(this, {
			set: (target, prop, value) => {
				// @ts-ignore
				if (!prop.startsWith("$") && value !== target.$original[prop]) {
					// @ts-ignore
					target.$changes[prop] = value;
				}

				// @ts-ignore
				target[prop] = value;
				return true;
			},
		});
	}

	public static async insert<M extends typeof Model<any>>(
		this: M,
		doc: IQueryBuilderFormSchema<M["$schema"]>,
		options?: InsertOneOptions,
	) {
		return this.query().insert(doc, options);
	}

	public static async create<M extends typeof Model<any>>(
		this: M,
		doc: IQueryBuilderFormSchema<M["$schema"]>,
		options?: InsertOneOptions,
	) {
		return this.query().create(doc, options);
	}

	public static async insertMany<M extends typeof Model<any>>(
		this: M,
		doc: IQueryBuilderFormSchema<M["$schema"]>[],
		options?: BulkWriteOptions,
	) {
		return this.query().insertMany(doc, options);
	}

	public static async createMany<M extends typeof Model<any>>(
		this: M,
		doc: IQueryBuilderFormSchema<M["$schema"]>[],
		options?: BulkWriteOptions,
	) {
		return this.query().createMany(doc, options);
	}

	public static async updateOrCreate<M extends typeof Model<any>>(
		this: M,
		filter: Partial<IQueryBuilderFormSchema<M["$schema"]>>,
		doc?: Partial<IQueryBuilderFormSchema<M["$schema"]>>,
		options?: FindOneAndUpdateOptions | InsertOneOptions,
	) {
		return this.query().updateOrCreate(filter, doc, options);
	}

	public static async updateOrInsert<M extends typeof Model<any>>(
		this: M,
		filter: Partial<IQueryBuilderFormSchema<M["$schema"]>>,
		doc?: Partial<IQueryBuilderFormSchema<M["$schema"]>>,
		options?: FindOneAndUpdateOptions | InsertOneOptions,
	) {
		return this.query().updateOrInsert(filter, doc, options);
	}

	public static destroy<M extends typeof Model<any>>(
		this: M,
		...ids: (string | ObjectId | (string | ObjectId)[])[]
	) {
		const flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
			return acc.concat(Array.isArray(id) ? id : [id]);
		}, []);

		return this.query().destroy(...flattenedIds);
	}

	public static forceDestroy<M extends typeof Model<any>>(
		this: M,
		...ids: (string | ObjectId | (string | ObjectId)[])[]
	) {
		const flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
			return acc.concat(Array.isArray(id) ? id : [id]);
		}, []);
		return this.query().forceDestroy(...flattenedIds);
	}

	public static select<M extends typeof Model<any>>(
		this: M,
		...fields: (
			| keyof M["$schema"]
			| Array<keyof M["$schema"]>
			| (string & {})
		)[]
	) {
		return this.query().select(...fields);
	}

	public static exclude<M extends typeof Model<any>>(
		this: M,
		...fields: (
			| keyof M["$schema"]
			| Array<keyof M["$schema"]>
			| (string & {})
		)[]
	) {
		return this.query().exclude(...fields);
	}

	public static where<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		operator: any,
		value: any = null,
	) {
		return this.query().where(column, operator, value);
	}

	public static orWhere<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		operator: any,
		value: any = null,
	) {
		return this.query().orWhere(column, operator, value);
	}

	public static whereNot<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: any,
	) {
		return this.query().whereNot(column, value);
	}

	public static orWhereNot<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: any,
	) {
		return this.query().orWhereNot(column, value);
	}

	public static whereIn<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: any[],
	) {
		return this.query().whereIn(column, value);
	}

	public static orWhereIn<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: any[],
	) {
		return this.query().orWhereIn(column, value);
	}

	public static whereNotIn<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: any[],
	) {
		return this.query().whereNotIn(column, value);
	}

	public static orWhereNotIn<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: any[],
	) {
		return this.query().orWhereNotIn(column, value);
	}

	public static whereBetween<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: [number, number?],
	) {
		return this.query().whereBetween(column, value);
	}

	public static orWhereBetween<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		value: [number, number?],
	) {
		return this.query().orWhereBetween(column, value);
	}

	public static whereNull<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().whereNull(column);
	}

	public static orWhereNull<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().orWhereNull(column);
	}

	public static whereNotNull<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().whereNotNull(column);
	}

	public static orWhereNotNull<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().orWhereNotNull(column);
	}

	public static withTrashed<M extends typeof Model<any>>(this: M) {
		return this.query().withTrashed();
	}

	public static onlyTrashed<M extends typeof Model<any>>(this: M) {
		return this.query().onlyTrashed();
	}

	public static offset<M extends typeof Model<any>>(this: M, value: number) {
		return this.query().offset(value);
	}

	public static skip<M extends typeof Model<any>>(this: M, value: number) {
		return this.query().skip(value);
	}

	public static orderBy<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
		direction: "asc" | "desc" = "asc",
		caseSensitive: boolean = false,
	) {
		return this.query().orderBy(column, direction, caseSensitive);
	}

	public static groupBy<M extends typeof Model<any>>(
		this: M,
		...fields: (
			| keyof M["$schema"]
			| Array<keyof M["$schema"]>
			| (string & {})
		)[]
	) {
		return this.query().groupBy(...fields);
	}

	public static limit<M extends typeof Model<any>>(this: M, value: number) {
		return this.query().limit(value);
	}

	public static take<M extends typeof Model<any>>(this: M, value: number) {
		return this.query().limit(value);
	}

	public static get<M extends typeof Model<any>, K extends keyof M["$schema"]>(
		this: M,
		...fields: (K | Array<K> | (string & {}))[]
	): Promise<Pick<M["$schema"], K>[]> {
		return this.query().get(...fields);
	}

	public static all<M extends typeof Model<any>>(this: M) {
		return this.query().all();
	}

	public static async pluck<
		M extends typeof Model<any>,
		K extends keyof M["$schema"],
	>(
		this: M,
		...fields: (K | Array<K> | (string & {}))[]
	): Promise<Pick<M["$schema"], K>[]> {
		return this.query().pluck(...fields);
	}

	public static paginate<M extends typeof Model<any>>(
		this: M,
		page: number = 1,
		limit: number = 15,
	) {
		return this.query().paginate(page, limit);
	}

	public static first<
		M extends typeof Model<any>,
		K extends keyof M["$schema"],
	>(
		this: M,
		...fields: (K | Array<K> | (string & {}))[]
	): Promise<Pick<M["$schema"], K> | null> {
		return this.query().first(...fields);
	}

	public static firstOrCreate<M extends typeof Model<any>>(
		this: M,
		filter: Partial<M["$schema"]>,
		doc?: Partial<IQueryBuilderFormSchema<M["$schema"]>>,
		options?: InsertOneOptions,
	) {
		return this.query().firstOrCreate(filter, doc, options);
	}

	public static firstOrNew<M extends typeof Model<any>>(
		this: M,
		filter: Partial<M["$schema"]>,
		doc?: Partial<IQueryBuilderFormSchema<M["$schema"]>>,
		options?: InsertOneOptions,
	) {
		return this.query().firstOrNew(filter, doc, options);
	}

	public static find<M extends typeof Model<any>>(
		this: M,
		id: string | ObjectId,
	): Promise<InstanceType<M>> {
		return this.query().find(id) as Promise<InstanceType<M>>;
	}

	public static async findOrFail(id: string | ObjectId) {
		return this.query().findOrFail(id);
	}

	public static count<M extends typeof Model<any>>(this: M) {
		return this.query().count();
	}

	public static max<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().max(column);
	}

	public static min<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().min(column);
	}

	public static avg<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().avg(column);
	}

	public static sum<M extends typeof Model<any>>(
		this: M,
		column: keyof M["$schema"] | (string & {}),
	) {
		return this.query().sum(column);
	}

	public static with<M extends typeof Model<any>>(
		this: M,
		relation: string | Record<string, string[]>,
		options: IRelationshipOptions = {},
	) {
		const model = this.query();
		model.setOptions(options);

		if (typeof relation === "string") {
			const [_relation, ...rest] = relation.split(".");
			if (relation.includes(".")) {
				relation = _relation;
				model.setNested([...model.getNested(), ...rest]);
			}

			model.setAlias(relation);

			if (typeof model[relation] === "function") {
				model[relation]();
			}
		} else if (typeof relation === "object") {
			for (const key in relation) {
				model.setAlias(key);
				model.setNested(relation[key]);

				if (typeof model[key] === "function") {
					model[key]();
				}
			}
		}

		return model;
	}

	public with(
		relation: string | Record<string, string[]>,
		options: IRelationshipOptions = {},
	) {
		this.setOptions(options);

		if (typeof relation === "string") {
			const [_relation, ...rest] = relation.split(".");
			if (relation.includes(".")) {
				relation = _relation;
				this.$nested = [...this.$nested, ...rest];
			}

			this.setAlias(relation);

			if (typeof this[relation] === "function") {
				this[relation]();
			}
		} else if (typeof relation === "object") {
			for (const key in relation) {
				this.setAlias(key);
				this.$nested = relation[key];

				if (typeof this[key] === "function") {
					this[key]();
				}
			}
		}

		return this;
	}

	public hasMany<M>(
		model: new () => Model<M>,
		foreignKey?: keyof M,
		localKey?: keyof T,
	): HasMany<T, M> {
		const relation = new model();

		if (!foreignKey)
			foreignKey = (this.constructor.name.toLowerCase() + "Id") as keyof M;
		if (!localKey) localKey = "_id" as keyof T;

		const hasMany: IRelationshipHasMany = {
			type: IRelationshipTypes.hasMany,
			model: this,
			relatedModel: relation,
			foreignKey: foreignKey as string,
			localKey: localKey as string,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookups = HasMany.generate(hasMany);
		this.setLookups([...this.getLookups(), ...lookups]);

		return new HasMany<T, M>(this, relation, foreignKey, localKey);
	}

	public hasOne<M>(
		model: new () => Model<M>,
		foreignKey?: keyof M,
		localKey?: keyof T,
	): HasOne<T, M> {
		const relation = new model();

		if (!foreignKey)
			foreignKey = (this.constructor.name.toLowerCase() + "Id") as keyof M;

		if (!localKey) localKey = "_id" as keyof T;

		const hasOne: IRelationshipHasOne = {
			type: IRelationshipTypes.hasOne,
			model: this,
			relatedModel: relation,
			foreignKey: foreignKey as string,
			localKey: localKey as string,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookups = HasOne.generate(hasOne);
		this.setLookups([...this.getLookups(), ...lookups]);

		return new HasOne<T, M>(this, relation, foreignKey, localKey);
	}

	public belongsTo<M>(
		model: new () => Model<M>,
		foreignKey?: keyof T,
		ownerKey?: keyof M,
	): BelongsTo<T, M> {
		const relation = new model();

		if (!foreignKey)
			foreignKey = (relation.constructor.name.toLowerCase() + "Id") as keyof T;
		if (!ownerKey) ownerKey = "_id" as keyof M;

		const belongsTo: IRelationshipBelongsTo = {
			type: IRelationshipTypes.belongsTo,
			model: this,
			relatedModel: relation,
			foreignKey: foreignKey as string,
			ownerKey: ownerKey as string,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookupsBelongsTo = BelongsTo.generate(belongsTo);
		this.setLookups([...this.getLookups(), ...lookupsBelongsTo]);

		return new BelongsTo<T, M>(this, relation, foreignKey, ownerKey);
	}

	public hasManyThrough<M, TM>(
		model: new () => Model<M>,
		throughModel: new () => Model<TM>,
		foreignKey?: keyof TM,
		foreignKeyThrough?: keyof M,
		localKey: keyof T = "_id" as keyof T,
		localKeyThrough: keyof TM = "_id" as keyof TM,
	): HasManyThrough<T, M, TM> {
		const relation = new model();
		const through = new throughModel();

		if (!foreignKey)
			foreignKey = (this.constructor.name.toLowerCase() + "Id") as keyof TM;
		if (!foreignKeyThrough)
			foreignKeyThrough = (through.constructor.name.toLowerCase() +
				"Id") as keyof M;

		const hasManyThrough: IRelationshipHasManyThrough = {
			type: IRelationshipTypes.hasManyThrough,
			model: this,
			relatedModel: relation,
			throughModel: through,
			foreignKey: foreignKey as string,
			foreignKeyThrough: foreignKeyThrough as string,
			localKey: localKey as string,
			localKeyThrough: localKeyThrough as string,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookups = HasManyThrough.generate(hasManyThrough);
		this.setLookups([...this.getLookups(), ...lookups]);

		return new HasManyThrough<T, M, TM>(
			this,
			relation,
			through,
			foreignKey,
			foreignKeyThrough,
			localKey,
			localKeyThrough,
		);
	}

	public belongsToMany<M, TM>(
		model: new () => Model<M>,
		collection?: string,
		foreignPivotKey?: keyof TM,
		relatedPivotKey?: keyof TM,
		parentKey: keyof T = "_id" as keyof T,
		relatedKey: keyof M = "_id" as keyof M,
	): BelongsToMany<T, M, TM> {
		const relation = new model();
		const names = [
			this.constructor.name.toLowerCase(),
			relation.constructor.name.toLowerCase(),
		].sort();

		if (!collection) collection = `${names[0]}_${names[1]}`;

		const pivot = Model.query();
		pivot.setCollection(collection);

		if (!foreignPivotKey)
			foreignPivotKey = (this.constructor.name.toLowerCase() +
				"Id") as keyof TM;
		if (!relatedPivotKey)
			relatedPivotKey = (relation.constructor.name.toLowerCase() +
				"Id") as keyof TM;

		const belongsToMany: IRelationshipBelongsToMany = {
			type: IRelationshipTypes.belongsToMany,
			model: this,
			relatedModel: relation,
			pivotModel: pivot,
			foreignPivotKey: foreignPivotKey as string,
			relatedPivotKey: relatedPivotKey as string,
			parentKey: parentKey as string,
			relatedKey: relatedKey as string,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookups = BelongsToMany.generate(belongsToMany);
		this.setLookups([...this.getLookups(), ...lookups]);

		return new BelongsToMany<T, M, TM>(
			this,
			relation,
			pivot,
			foreignPivotKey,
			relatedPivotKey,
			parentKey,
			relatedKey,
		);
	}

	public morphMany<M>(model: new () => Model<M>, name: string) {
		const relation = new model();
		const morphMany: IRelationshipMorphMany = {
			type: IRelationshipTypes.morphMany,
			model: this,
			relatedModel: relation,
			morph: name,
			morphId: `${name}Id`,
			morphType: `${name}Type`,
			alias: this.getAlias(),
			options: this.getOptions(),
		};

		const lookups = MorphMany.generate(morphMany);
		this.setLookups([...this.getLookups(), ...lookups]);
		return new MorphMany<T, M>(this, relation, name);
	}

	public morphTo<M>(model: new () => Model<M>, name: string) {
		const relation = new model();
		const morphTo: IRelationshipMorphTo = {
			type: IRelationshipTypes.morphTo,
			model: this,
			relatedModel: relation,
			morph: name,
			morphId: `${name}Id`,
			morphType: `${name}Type`,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookups = MorphTo.generate(morphTo);
		this.setLookups([...this.getLookups(), ...lookups]);

		return new MorphTo<T, M>(this, relation, name);
	}

	public morphToMany<M>(model: new () => Model<M>, name: string) {
		const relation = new model();

		const morphToMany: IRelationshipMorphToMany = {
			type: IRelationshipTypes.morphToMany,
			model: this,
			relatedModel: relation,
			morph: name,
			morphId: `${name}Id`,
			morphType: `${name}Type`,
			morphCollectionName: `${name}s`,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookups = MorphToMany.generate(morphToMany);
		this.setLookups([...this.getLookups(), ...lookups]);

		return new MorphToMany<T, M>(this, relation, name);
	}

	public morphedByMany<M>(model: new () => Model<M>, name: string) {
		const relation = new model();

		const morphedByMany: IRelationshipMorphedByMany = {
			type: IRelationshipTypes.morphedByMany,
			model: this,
			relatedModel: relation,
			morph: name,
			morphId: `${name}Id`,
			morphType: `${name}Type`,
			morphCollectionName: `${name}s`,
			alias: this.getAlias(),
			options: this.getOptions(),
		};
		const lookups = MorphedByMany.generate(morphedByMany);
		this.setLookups([...this.getLookups(), ...lookups]);

		return new MorphedByMany<T, M>(this, relation, name);
	}

	static without(this: typeof Model<any>, ...relations: (string | string[])[]) {
		const flattenedRelations = relations.reduce<string[]>((acc, relation) => {
			return acc.concat(Array.isArray(relation) ? relation : [relation]);
		}, []);

		const model = new this();
		model.$without = [...flattenedRelations];

		model.runDefaultRelation();
		return model;
	}

	static withOnly(
		this: typeof Model<any>,
		...relations: (string | string[])[]
	) {
		const flattenedRelations = relations.reduce<string[]>((acc, relation) => {
			return acc.concat(Array.isArray(relation) ? relation : [relation]);
		}, []);

		const model = new this();
		model.$withOnly = [...flattenedRelations];

		model.runDefaultRelation();
		return model;
	}

	public static query<M extends typeof Model<any>>(
		this: M,
	): Model<M["$schema"]> {
		const model = new this();

		if (this.$connection) model.setConnection(this.$connection);
		if (this.$databaseName) model.setDatabaseName(this.$databaseName);
		if (this.$timezone) model.setTimezone(this.$timezone);

		model.runDefaultRelation();
		return model;
	}

	private runDefaultRelation() {
		let _with = this.getWith();

		if (this.getWithOnly().length > 0) _with = this.getWithOnly();
		if (this.getWithOnly().length === 0 && this.getWithout().length > 0) {
			_with = this.getWith().filter((el) => !this.getWithout().includes(el));
		}

		_with.forEach((el) => {
			this.with(el);
		});
		return this;
	}

	public getWith(): string[] {
		return this.$with;
	}

	public setWith(withs: string[]): this {
		this.$with = withs;

		return this;
	}

	public addWith(param: string): this {
		this.$with.push(param);
		return this;
	}

	public getNested(): string[] {
		return this.$nested;
	}

	public setNested(nested: string[]) {
		this.$nested = nested;
	}

	public addNested(param: string): this {
		this.$nested.push(param);
		return this;
	}

	public getWithout(): string[] {
		return this.$without;
	}

	public setWithout(without: string[]) {
		this.$without = without;
	}

	public addWithout(param: string): this {
		this.$without.push(param);
		return this;
	}

	public getWithOnly(): string[] {
		return this.$withOnly;
	}

	public setWithOnly(withOnly: string[]) {
		this.$withOnly = withOnly;
	}

	public addWithOnly(param: string): this {
		this.$withOnly.push(param);
		return this;
	}
}

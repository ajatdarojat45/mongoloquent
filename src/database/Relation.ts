import Query from "./Query";
import {
  RelationInterface,
  WithOptionsInterface,
} from "../interfaces/RelationInterface";
import Model from "./Model";
import { ObjectId } from "mongodb";
import { deepClone } from "../helpers/deepClone";

class Relation extends Query implements RelationInterface {
  protected static lookups: object[] = [];
  protected static relation: object = {};
  protected static alias: string = "";
  protected static options: object = {};

  public static with<T extends typeof Relation>(
    this: T,
    relation: string,
    options: WithOptionsInterface = {}
  ): T {
    if (typeof (this as any)[relation] === "function") {
      this.alias = relation;
      this.options = options;
      (this as any)[relation]();
    } else {
      console.log(
        `The ${relation} method does not exist in the ${this.name} model.`
      );
    }

    return this;
  }

  public static has<T extends typeof Relation>(
    this: T,
    relation: string,
    options: WithOptionsInterface = {}
  ): T {
    return this.with(relation, options);
  }

  protected static belongsTo<T extends typeof Relation>(
    this: T,
    model: typeof Model | string,
    foreignKey: string,
    ownerKey: string = "_id"
  ): T {
    const collection = typeof model === "string" ? model : model.collection;

    this.relation = {
      collection,
      foreignKey: ownerKey,
      localKey: foreignKey,
      type: "belongsTo",
      model: model,
    };

    this.generateBelongsTo();
    return this;
  }

  protected static generateBelongsTo<T extends typeof Relation>(this: T): T {
    const { collection, foreignKey, localKey, model } = this.relation as any;
    const alias = this.alias;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let _foreignKey = foreignKey;
    let _localKey = localKey;

    if (this.fields.length > 0) {
      _localKey = `document.${_localKey}`;
    }

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    const lookup = {
      from: collection,
      localField: `${_localKey}`,
      foreignField: `${_foreignKey}`,
      as: alias,
      pipeline: pipeline,
    };

    _lookups.push({
      $lookup: lookup,
    });

    const _unwind = {
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    _lookups.push(_unwind);

    this.lookups = _lookups;
    this.selectFields();

    return this;
  }

  protected static hasOne<T extends typeof Relation>(
    this: T,
    model: typeof Model | string,
    foreignKey: string,
    localKey: string = "_id"
  ): T {
    const collection = typeof model === "string" ? model : model.collection;
    this.relation = {
      collection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "hasOne",
      model: model,
    };

    this.generateHasOne();
    return this;
  }

  protected static generateHasOne<T extends typeof Relation>(this: T): T {
    const { collection, foreignKey, localKey, model } = this.relation as any;
    const alias = this.alias;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    const lookup = {
      from: collection,
      localField: localKey,
      foreignField: foreignKey,
      as: alias,
      pipeline: pipeline,
    };

    _lookups.push({ $lookup: lookup });
    _lookups.push({
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    this.lookups = _lookups;
    this.selectFields();

    return this;
  }

  protected static hasMany(
    model: typeof Model,
    foreignKey: string,
    localKey: string = "_id"
  ): Model {
    const collection = model.collection;

    this.relation = {
      collection,
      foreignKey: foreignKey,
      localKey: localKey,
      type: "hasMany",
      model: deepClone(model),
    };

    this.generateHasMany();

    const {
      model: _model,
      collection: _collection,
      ...rest
    }: any = this.relation as any;

    this.relation = {};

    const clonedModel = Object.assign(
      Object.create(Object.getPrototypeOf(model)),
      model
    );

    clonedModel.relation = {
      ...rest,
      relationModel: this,
    };

    return clonedModel;
  }

  protected static generateHasMany<T extends typeof Relation>(this: T): T {
    const { collection, foreignKey, localKey, model } = this.relation as any;
    const alias = this.alias;
    const _lookups = deepClone(this.lookups);

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    const lookup = {
      from: collection,
      localField: localKey,
      foreignField: foreignKey,
      as: alias || "alias",
      pipeline: pipeline,
    };

    _lookups.push({ $lookup: lookup });
    _lookups.push({
      $project: {
        alias: 0,
      },
    });

    this.lookups = _lookups;
    this.selectFields();

    return this;
  }

  protected static belongsToMany(
    model: typeof Model,
    pivotModel: typeof Model | string,
    foreignKey: string,
    foreignKeyTarget: string
  ): Model {
    const collection = model.collection;
    const pivotCollection =
      typeof pivotModel === "string" ? pivotModel : pivotModel.collection;

    this.relation = {
      collection,
      pivotCollection,
      foreignKey: foreignKey,
      localKey: foreignKeyTarget,
      type: "belongsToMany",
      model,
    };

    this.generateBelongsToMany();

    const {
      model: _model,
      collection: _collection,
      ...rest
    }: any = this.relation as any;

    this.relation = {};

    const clonedModel = Object.assign(
      Object.create(Object.getPrototypeOf(model)),
      model
    );

    clonedModel.relation = {
      ...rest,
      relationModel: this,
    };

    return clonedModel;
  }

  protected static generateBelongsToMany<T extends typeof Relation>(
    this: T
  ): T {
    const { collection, pivotCollection, foreignKey, localKey, model } = this
      .relation as any;
    const alias = this.alias;

    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    _lookups.push(
      {
        $lookup: {
          from: pivotCollection,
          localField: "_id",
          foreignField: foreignKey,
          as: "pivot",
          //pipeline,
        },
      },
      {
        $lookup: {
          from: collection,
          localField: `pivot.${localKey}`,
          foreignField: "_id",
          as: alias || "pivot",
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookups = _lookups;
    this.selectFields();
    return this;
  }

  protected static hasManyThrough(
    model: typeof Model,
    throughModel: typeof Model | string,
    foreignKey: string,
    foreignKeyThrough: string
  ): Model {
    const collection = model.collection;
    const throughCollection =
      typeof throughModel === "string" ? throughModel : throughModel.collection;

    this.relation = {
      collection,
      throughCollection,
      foreignKey: foreignKeyThrough,
      localKey: foreignKey,
      type: "hasManyThrough",
      model: model,
    };

    this.generateHasManyThrough();

    const {
      model: _model,
      collection: _collection,
      ...rest
    }: any = this.relation as any;

    this.relation = {};

    model.relation = {
      ...rest,
      relationModel: this,
    };

    return model;
  }

  protected static generateHasManyThrough<T extends typeof Relation>(
    this: T
  ): T {
    const { collection, throughCollection, foreignKey, localKey, model } = this
      .relation as any;
    const alias = this.alias;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    _lookups.push(
      {
        $lookup: {
          from: throughCollection,
          localField: "_id",
          foreignField: localKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: collection,
          localField: "pivot._id",
          foreignField: `${foreignKey}`,
          as: alias,
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookups = _lookups;
    this.selectFields();
    return this;
  }

  protected static morphTo(model: typeof Model, relation: string): Model {
    const collection: string = model.collection;

    this.relation = {
      collection,
      relationId: `${relation}Id`,
      relationType: `${relation}Type`,
      type: "morphTo",
      model: model,
    };

    this.generateMorphTo();

    const {
      model: _model,
      collection: _collection,
      ...rest
    } = this.relation as any;

    model.relation = {
      ...rest,
      relationModel: this,
    };

    return model;
  }

  protected static generateMorphTo<T extends typeof Relation>(this: T): T {
    const { collection, relationId, relationType, model } = this
      .relation as any;
    const alias = this.alias;

    if (alias === "") return this;

    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$isDeleted", false] },
                {
                  $eq: [`$${relationType}`, this.name],
                },
              ],
            },
          },
        },
      ];
    } else {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [`$${relationType}`, this.name],
                },
              ],
            },
          },
        },
      ];
    }

    const lookup = {
      from: collection,
      localField: "_id",
      foreignField: relationId,
      as: alias,
      pipeline: pipeline,
    };

    _lookups.push({ $lookup: lookup });
    _lookups.push({
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    this.lookups = _lookups;
    this.selectFields();

    return this;
  }

  protected static morphMany(model: typeof Model, relation: string): Model {
    const collection: string = model.collection;

    this.relation = {
      collection,
      relationId: `${relation}Id`,
      relationType: `${relation}Type`,
      type: "morphMany",
      model: model,
    };

    this.generateMorphMany();

    const {
      model: _model,
      collection: _collection,
      ...rest
    } = this.relation as any;

    this.relation = {};

    model.relation = {
      ...rest,
      relationModel: this,
    };

    return model;
  }

  protected static generateMorphMany<T extends typeof Relation>(this: T): T {
    const { collection, relationId, relationType, model } = this
      .relation as any;
    const alias = this.alias;

    if (alias === "") return this;

    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$isDeleted", false] },
                {
                  $eq: [`$${relationType}`, this.name],
                },
              ],
            },
          },
        },
      ];
    } else {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [`$${relationType}`, this.name],
                },
              ],
            },
          },
        },
      ];
    }

    const lookup = {
      from: collection,
      localField: "_id",
      foreignField: relationId,
      as: alias,
      pipeline: pipeline,
    };

    _lookups.push({ $lookup: lookup });

    this.lookups = _lookups;
    this.selectFields();

    return this;
  }

  protected static morphToMany(model: typeof Model, relation: string): Model {
    this.relation = {
      collection: model.collection,
      pivotCollection: `${relation}s`,
      foreignKey: `${model.name.toLowerCase()}Id`,
      relationId: `${relation}Id`,
      relationType: `${relation}Type`,
      type: "morphToMany",
      model: model,
    };

    this.generateMorphToMany();

    const {
      model: _model,
      collection: _collection,
      ...rest
    } = this.relation as any;

    this.relation = {};

    model.relation = {
      ...rest,
      relationModel: this,
    };

    return model;
  }

  protected static generateMorphToMany<T extends typeof Relation>(this: T): T {
    const {
      collection,
      pivotCollection,
      foreignKey,
      relationId,
      relationType,
      model,
    } = this.relation as any;
    const alias = this.alias;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    _lookups.push(
      {
        $lookup: {
          from: pivotCollection,
          localField: "_id",
          foreignField: `${relationId}`,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [`$${relationType}`, this.name],
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
          from: collection,
          localField: `pivot.${foreignKey}`,
          foreignField: "_id",
          as: alias,
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookups = _lookups;
    this.selectFields();

    return this;
  }

  protected static morphedByMany(model: typeof Model, relation: string): Model {
    this.relation = {
      collection: model.collection,
      pivotCollection: `${relation}s`,
      foreignKey: `${this.name.toLowerCase()}Id`,
      relationId: `${relation}Id`,
      relationType: `${relation}Type`,
      type: "morphedByMany",
      model: model,
    };

    this.generateMorphedByMany();

    const {
      model: _model,
      collection: _collection,
      ...rest
    } = this.relation as any;

    this.relation = {};

    model.relation = {
      ...rest,
      relationModel: this,
    };

    return model;
  }

  protected static generateMorphedByMany<T extends typeof Relation>(
    this: T
  ): T {
    const {
      collection,
      pivotCollection,
      foreignKey,
      relationId,
      relationType,
      model,
    } = this.relation as any;
    const alias = this.alias;
    const _lookups = JSON.parse(JSON.stringify(this.lookups));

    let isSoftDelete = false;
    let pipeline: any[] = [];

    if (typeof model !== "string") {
      isSoftDelete = model?.softDelete || false;
    }

    if (isSoftDelete) {
      pipeline = [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      ];
    }

    _lookups.push(
      {
        $lookup: {
          from: pivotCollection,
          localField: "_id",
          foreignField: `${foreignKey}`,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [`$${relationType}`, model.name],
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
          from: collection,
          localField: `pivot.${relationId}`,
          foreignField: "_id",
          as: alias,
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    this.lookups = _lookups;
    this.selectFields();

    return this;
  }

  public static async attach(
    payload: string | string[] | ObjectId | ObjectId[]
  ): Promise<object> {
    const relation: any = this.relation;
    const data = relation.relationModel?.data;

    let ids: ObjectId[] = [];
    let qFind = {};
    let key = "";

    if (!Array.isArray(payload)) {
      ids = payload ? [new ObjectId(payload)] : [];
    } else {
      ids = payload.map((el) => new ObjectId(el));
    }

    const collection = this.getCollection(relation.pivotCollection);
    const _payload: object[] = [];

    if ((relation as any).type === "belongsToMany") {
      key = relation.localKey;

      qFind = {
        [relation.localKey]: {
          $in: ids,
        },
        [relation.foreignKey]: data._id,
      };

      ids.forEach((id) =>
        _payload.push({
          [relation.foreignKey]: data._id,
          [relation.localKey]: id,
        })
      );
    } else if ((relation as any).type === "morphToMany") {
      key = relation.foreignKey;

      qFind = {
        [relation.foreignKey]: { $in: ids },
        [relation.relationId]: data._id,
        [relation.relationType]: relation.relationModel?.name,
      };

      ids.forEach((id) =>
        _payload.push({
          [relation.foreignKey]: id,
          [relation.relationId]: data._id,
          [relation.relationType]: relation.relationModel?.name,
        })
      );
    }

    // find data
    const existingData = await collection.find(qFind).toArray();

    // check data
    for (let i = 0; i < ids.length; i++) {
      const existingItem = existingData.find((item: any) => {
        return JSON.stringify(item[key]) === JSON.stringify(ids[i]);
      });

      // insert if data does not exist
      if (!existingItem) {
        await collection.insertOne(_payload[i]);
      }
    }

    return {
      message: "Attach successfully",
    };
  }

  public static async detach(
    payload: string | string[] | ObjectId | ObjectId[]
  ): Promise<object> {
    const relation: any = this.relation;
    const data = relation.relationModel?.data;
    let ids: ObjectId[] = [];
    let isDeleteAll = false;

    if (!Array.isArray(payload)) {
      ids = payload ? [new ObjectId(payload)] : [];
      isDeleteAll = !payload && true;
    } else {
      ids = payload.map((el) => new ObjectId(el));
    }

    const collection = this.getCollection(relation.pivotCollection);
    let q: any = {};

    if ((relation as any).type === "belongsToMany") {
      q = {
        [relation.localKey]: {
          $in: ids,
        },
        [relation.foreignKey]: data._id,
      };

      isDeleteAll && delete q[relation.localKey];

      await collection.deleteMany(q);
    } else if ((relation as any).type === "morphToMany") {
      q = {
        [relation.foreignKey]: { $in: ids },
        [relation.relationId]: data._id,
        [relation.relationType]: relation.relationModel?.name,
      };

      isDeleteAll && delete q[relation.foreignKey];

      await collection.deleteMany(q);
    }

    return {
      message: "Detach successfully",
    };
  }

  public static async sync(
    payload: string | string[] | ObjectId | ObjectId[]
  ): Promise<object> {
    const relation: any = this.relation;
    const data = relation.relationModel?.data;
    let ids: ObjectId[] = [];

    if (!Array.isArray(payload)) {
      ids = [new ObjectId(payload)];
    } else {
      ids = payload.map((el) => new ObjectId(el));
    }

    const db = this.getDb();
    const collection = db.collection(relation.pivotCollection);
    const _payload: object[] = [];
    let qFind = {};
    let qDelete = {};
    let key = "";

    if ((relation as any).type === "belongsToMany") {
      key = relation.localKey;

      qFind = {
        [relation.localKey]: {
          $in: ids,
        },
        [relation.foreignKey]: data._id,
      };

      qDelete = {
        [relation.localKey]: {
          $nin: ids,
        },
        [relation.foreignKey]: data._id,
      };

      ids.forEach((id) =>
        _payload.push({
          [relation.foreignKey]: data._id,
          [relation.localKey]: id,
        })
      );
    } else if ((relation as any).type === "morphToMany") {
      key = relation.foreignKey;

      qFind = {
        [relation.foreignKey]: { $in: ids },
        [relation.relationId]: data._id,
        [relation.relationType]: relation.relationModel?.name,
      };

      qDelete = {
        [relation.foreignKey]: { $nin: ids },
        [relation.relationId]: data._id,
        [relation.relationType]: relation.relationModel?.name,
      };

      ids.forEach((id) =>
        _payload.push({
          [relation.foreignKey]: id,
          [relation.relationId]: data._id,
          [relation.relationType]: relation.relationModel?.name,
        })
      );
    }

    // find data
    const existingData = await collection.find(qFind).toArray();

    // check data
    for (let i = 0; i < ids.length; i++) {
      const existingItem = existingData.find(
        (item: any) => JSON.stringify(item[key]) === JSON.stringify(ids[i])
      );

      // insert if data does not exist
      if (!existingItem) {
        await collection.insertOne(_payload[i]);
      }
    }

    // delete data
    await collection.deleteMany(qDelete);
    return {
      message: "Sync successfully",
    };
  }

  protected static selectFields() {
    const alias = this.alias as any;
    const options = this.options as any;

    if (options?.select && options?.select?.length > 0) {
      let project = {
        $project: {
          document: "$$ROOT",
        },
      };

      options?.select?.forEach((field: any) => {
        project = {
          ...project,
          $project: {
            ...project.$project,
            [`${alias}.${field}`]: 1,
          },
        };
      });

      const additionals = [
        {
          $set: {
            [`document.${alias}`]: `$${alias}`,
          },
        },
        {
          $replaceRoot: {
            newRoot: "$document",
          },
        },
      ];

      this.lookups.push(project, ...additionals);
    }

    if (options?.exclude && options?.exclude?.length > 0) {
      let project = {
        $project: {},
      };

      options?.exclude?.forEach((field: any) => {
        project = {
          ...project,
          $project: {
            ...project.$project,
            [`${alias}.${field}`]: 0,
          },
        };
      });

      this.lookups.push(project);
    }

    return this;
  }

  public static resetRelation() {
    this.lookups = [];
    this.relation = {};
    this.alias = "";
    this.options = {};
    return this;
  }
}

export default Relation;

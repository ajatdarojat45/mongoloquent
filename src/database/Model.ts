import Relation from "./Relation";
import dayjs from "../utils/dayjs";
import checkTimestamps from "../helpers/checkTimestaps";
import checkSoftDelete from "../helpers/checkSoftDelete";
import { ObjectId } from "mongodb";
import {
  PaginateInterface,
  ModelInterface,
} from "../interfaces/ModelInterface";

class Model extends Relation implements ModelInterface {
  public static data: object | null = null;

  static async all(): Promise<object[]> {
    try {
      const collection = this.getCollection();

      let q = {};

      if (this.softDelete) q = { isDeleted: false };

      return await collection.find(q).toArray();
    } catch (error) {
      throw error;
    }
  }

  static async get(fields?: string | string[]): Promise<object[]> {
    try {
      if (fields) this.select(fields);

      const aggregate = await this.aggregate();
      this.resetQuery();
      this.resetRelation();

      return await aggregate.toArray();
    } catch (error) {
      throw error;
    }
  }

  static async first<T extends typeof Model>(
    this: T,
    fields?: string | string[]
  ): Promise<T> {
    try {
      if (fields) this.select(fields);

      const aggregate = await this.aggregate();
      this.resetQuery();
      this.resetRelation();

      (this as any).data = await aggregate.next();
      return this;
    } catch (error) {
      throw error;
    }
  }

  static async find<T extends typeof Model>(
    this: T,
    id: string | ObjectId
  ): Promise<T> {
    try {
      let _id = id;

      if (typeof _id === "string") _id = new ObjectId(_id);

      this.where("_id", _id);
      const aggregate = await this.aggregate();
      this.resetQuery();
      this.resetRelation();

      (this as any).data = await aggregate.next();
      return this;
    } catch (error) {
      throw error;
    }
  }

  static async paginate(
    page: number = 1,
    perPage: number = this.perPage
  ): Promise<PaginateInterface> {
    try {
      const aggregate = await this.aggregate();
      const collection = this.getCollection();
      let totalResult = await collection
        .aggregate([
          this.queries,
          {
            $count: "total",
          },
        ])
        .next();
      let total = 0;

      if (totalResult?.total) total = totalResult?.total;

      const result = await aggregate
        .skip((page - 1) * perPage)
        .limit(perPage)
        .toArray();

      this.resetQuery();
      this.resetRelation();

      return {
        data: result,
        meta: {
          total,
          page,
          perPage,
          lastPage: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  protected static async aggregate() {
    try {
      const _relation: any = this.relation;

      switch (_relation.type) {
        case "hasMany":
          this.where(_relation.foreignKey, _relation.relationModel?.data._id);
          break;
        case "belongsToMany":
          const belongsToManyCollection = this.getCollection(
            _relation.pivotCollection
          );

          const belongsToManyIds = await belongsToManyCollection
            .find({
              [_relation.foreignKey]: _relation.relationModel?.data._id,
            })
            .map((el) => el[_relation.localKey])
            .toArray();

          this.whereIn("_id", belongsToManyIds);
          break;
        case "hasManyThrough":
          const hasManyThroughCollection = this.getCollection(
            _relation.throughCollection
          );

          const hasManyThroughIds = await hasManyThroughCollection
            .find({
              [_relation.localKey]: _relation.relationModel?.data._id,
            })
            .map((el) => el._id)
            .toArray();

          this.whereIn(_relation.foreignKey, hasManyThroughIds);

          break;
        case "morphMany":
          this.where(
            _relation.relationType,
            _relation.relationModel?.name
          ).where(_relation.relationId, _relation.relationModel?.data?._id);
          break;
        case "morphToMany":
          const morphToManyCollection = this.getCollection(
            _relation.pivotCollection
          );

          const morphToManyIds = await morphToManyCollection
            .find({
              [_relation.relationType]: _relation.relationModel.name,
              [_relation.relationId]: _relation.relationModel?.data._id,
            })
            .map((el) => el[_relation.foreignKey])
            .toArray();

          this.whereIn("_id", morphToManyIds);
          break;
        case "morphedByMany":
          const morphedByManyCollection = this.getCollection(
            _relation.pivotCollection
          );

          const morphedByManyIds = await morphedByManyCollection
            .find({
              [_relation.relationType]: this.name,
              [_relation.foreignKey]: _relation.relationModel?.data._id,
            })
            .map((el) => el[_relation.relationId])
            .toArray();

          this.whereIn("_id", morphedByManyIds);
          break;
      }

      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();

      if (this.$queries.length > 0) {
        this.$queries.forEach((query) => {
          _pipeline.push(query);
        });
      } else {
        _pipeline.push(this.queries);
      }

      if (
        Object.entries(
          (this?.sorts?.[1] as { $sort?: Record<string, any> })?.$sort || {}
        ).length > 0
      )
        _pipeline.push(...this.sorts);

      if (this.fields.length > 0) {
        _pipeline.push(...this.fields);
      }

      if (this.groups.length > 0) _pipeline.push(...this.groups);
      if (this.groups.length === 0 && this.lookups.length > 0)
        _pipeline.push(...this.lookups);

      _pipeline.push({
        $project: {
          document: 0,
        },
      });

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      return collection.aggregate([..._pipeline]);
    } catch (error) {
      throw error;
    }
  }

  static async max(field: string): Promise<number> {
    try {
      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();
      _pipeline.push(this.queries);

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      const aggregate = await collection
        .aggregate([
          ..._pipeline,
          {
            $group: {
              _id: null,
              max: { $max: `$${field}` },
            },
          },
        ])
        .next();

      this.resetQuery();
      this.resetRelation();

      if (typeof aggregate?.max === "number") return aggregate?.max;
      else return 0;
    } catch (error) {
      throw error;
    }
  }

  static async min(field: string): Promise<number> {
    try {
      const collection = this.getCollection();
      const _pipeline = [];

      this.generateQuery();
      _pipeline.push(this.queries);

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      const aggregate = await collection
        .aggregate([
          ..._pipeline,
          {
            $group: {
              _id: null,
              min: { $min: `$${field}` },
            },
          },
        ])
        .next();

      this.resetQuery();
      this.resetRelation();

      if (typeof aggregate?.min === "number") return aggregate?.min;
      else return 0;
    } catch (error) {
      throw error;
    }
  }

  static async avg(field: string): Promise<number> {
    try {
      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();
      _pipeline.push(this.queries);

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      const aggregate = await collection
        .aggregate([
          ..._pipeline,
          {
            $group: {
              _id: null,
              avg: { $avg: { $avg: `$${field}` } },
            },
          },
        ])
        .next();

      this.resetQuery();
      this.resetRelation();

      return aggregate?.avg || 0;
    } catch (error) {
      throw error;
    }
  }

  static async sum(field: string): Promise<number> {
    try {
      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();
      _pipeline.push(this.queries);

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      const aggregate = await collection
        .aggregate([
          ..._pipeline,
          {
            $group: {
              _id: null,
              sum: { $sum: { $sum: `$${field}` } },
            },
          },
        ])
        .next();

      this.resetQuery();
      this.resetRelation();

      return aggregate?.sum || 0;
    } catch (error) {
      throw error;
    }
  }

  static async count(): Promise<number> {
    try {
      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();

      _pipeline.push(this.queries);

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      const aggregate = await collection
        .aggregate([
          ..._pipeline,
          {
            $count: "total",
          },
        ])
        .next();

      this.resetQuery();
      this.resetRelation();

      return aggregate?.total || 0;
    } catch (error) {
      throw error;
    }
  }

  static async pluck(field: string) {
    try {
      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();

      _pipeline.push(this.queries);

      if (this.$skip > 0) _pipeline.push({ $skip: this.$skip });
      if (this.$limit > 0) _pipeline.push({ $limit: this.$limit });

      const aggregate = await collection
        .aggregate([
          ..._pipeline,
          {
            $project: {
              [field]: 1,
            },
          },
        ])
        .toArray();

      this.resetQuery();
      this.resetRelation();
      return aggregate.map((item) => item[field]);
    } catch (error) {
      throw error;
    }
  }

  static async insert(payload: object): Promise<object> {
    try {
      const collection = this.getCollection();

      let _payload: object = checkSoftDelete(this.softDelete, payload);
      _payload = checkTimestamps(this.timestamps, _payload);

      const relationTypes = ["morphTo", "morphMany"];

      const _relation: any = this.relation;
      if (relationTypes.includes(_relation.type)) {
        _payload = {
          ..._payload,
          [_relation.relationType]: _relation.relationModel.name,
          [_relation.relationId]: _relation.relationModel.data._id,
        };
      }

      const data = await collection.insertOne({
        ..._payload,
      });

      this.resetQuery();
      this.resetRelation();
      return { _id: data.insertedId, ..._payload };
    } catch (error) {
      throw error;
    }
  }

  static async create(payload: object): Promise<object> {
    try {
      return await this.insert(payload);
    } catch (error) {
      throw error;
    }
  }

  static async save(payload: object): Promise<object> {
    try {
      return await this.insert(payload);
    } catch (error) {
      throw error;
    }
  }

  static async insertMany(payload: object[]): Promise<ObjectId[]> {
    try {
      const collection = this.getCollection();

      const _payload = payload.map((item) => {
        let _item: object = checkSoftDelete(this.softDelete, item);
        _item = checkTimestamps(this.timestamps, _item);

        const relationTypes = ["morphTo", "morphMany"];

        const _relation: any = this.relation;
        if (relationTypes.includes(_relation.type)) {
          _item = {
            ..._item,
            [_relation.relationType]: _relation.relationModel.name,
            [_relation.relationId]: _relation.relationModel.data._id,
          };
        }

        return _item;
      });

      const data = await collection.insertMany(_payload);

      const result: ObjectId[] = [];

      for (var key in data.insertedIds) {
        result.push(data.insertedIds[key]);
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async update(payload: object): Promise<object | null> {
    try {
      const collection = this.getCollection();
      const _payload = checkTimestamps(this.timestamps, payload);

      if ((_payload as any)?._id) delete (_payload as any)._id;

      if ((_payload as any)?.createdAt) delete (_payload as any).createdAt;

      this.generateQuery();

      const queries = this.queries?.$match || {};

      const data = await collection.findOneAndUpdate(
        queries,
        {
          $set: {
            ..._payload,
          },
        },
        {
          returnDocument: "after",
        }
      );

      this.resetQuery();
      this.resetRelation();
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateMany(payload: object): Promise<object> {
    try {
      const collection = this.getCollection();
      const _payload = checkTimestamps(this.timestamps, payload);

      if ((_payload as any)?._id) delete (_payload as any)._id;

      if ((_payload as any)?.createdAt) delete (_payload as any).createdAt;

      this.generateQuery();

      const queries = this.queries?.$match || {};

      const data = await collection.updateMany(queries, {
        $set: {
          ..._payload,
        },
      });

      this.resetQuery();
      this.resetRelation();
      return {
        modifiedCount: data.modifiedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  static async delete(): Promise<object | null> {
    try {
      const collection = this.getCollection();
      this.generateQuery();
      const q = this?.queries?.$match || {};

      if (this.softDelete) {
        const _data = await collection.findOneAndUpdate(
          q,
          {
            $set: {
              isDeleted: true,
              deletedAt: dayjs().toDate(),
            },
          },
          {
            returnDocument: "after",
          }
        );

        this.resetQuery();
        this.resetRelation();
        return _data;
      }

      this.resetQuery();
      this.resetRelation();
      const _data = await collection.findOneAndDelete(q);

      return _data || null;
    } catch (error) {
      throw error;
    }
  }

  static async deleteMany(): Promise<object> {
    try {
      const collection = this.getCollection();
      this.generateQuery();
      const q = this?.queries?.$match || {};

      if (this.softDelete) {
        const _data = await collection.updateMany(q, {
          $set: {
            isDeleted: true,
            deletedAt: dayjs().toDate(),
          },
        });

        this.resetQuery();
        this.resetRelation();

        return {
          deletedCount: _data.modifiedCount,
        };
      }

      this.resetQuery();
      this.resetRelation();

      const _data = await collection.deleteMany(q);

      return {
        deletedCount: _data.deletedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  static async destroy(
    id: string | string[] | ObjectId | ObjectId[]
  ): Promise<object> {
    try {
      const collection = this.getCollection();
      let q: ObjectId[] = [];

      if (!Array.isArray(id)) {
        q = [new ObjectId(id)];
      } else {
        q = id.map((el) => new ObjectId(el));
      }

      if (this.softDelete) {
        const _data = await collection.updateMany(
          {
            _id: {
              $in: q,
            },
          },
          {
            $set: {
              isDeleted: true,
              deletedAt: dayjs().toDate(),
            },
          }
        );

        return {
          deletedCount: _data.modifiedCount,
        };
      }

      const _data = await collection.deleteMany({
        _id: {
          $in: q,
        },
      });

      return {
        deletedCount: _data.deletedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  static async forceDelete(): Promise<object> {
    try {
      const collection = this.getCollection();

      this.onlyTrashed();
      this.generateQuery();

      const q = this?.queries?.$match || {};

      this.resetQuery();
      this.resetRelation();

      const _data = await collection.deleteMany(q);

      return {
        deletedCount: _data.deletedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  static async restore(): Promise<object> {
    try {
      this.onlyTrashed();
      this.generateQuery();

      const collection = this.getCollection();

      const q = this?.queries?.$match || {};
      const _payload = checkTimestamps(this.timestamps, {
        isDeleted: false,
        deletedAt: null,
      });

      if ((_payload as any)?.createdAt) delete (_payload as any).createdAt;

      const data = await collection.updateMany(q, {
        $set: _payload,
      });

      this.resetQuery();
      this.resetRelation();

      return {
        modifiedCount: data.modifiedCount,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default Model;

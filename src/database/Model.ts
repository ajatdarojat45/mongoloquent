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
  static async get(fields?: string | string[]): Promise<object[]> {
    try {
      if (fields) this.select(fields);

      const aggregate = this.aggregate();
      this.resetQuery();
      this.resetRelation();

      return await aggregate.toArray();
    } catch (error) {
      throw error;
    }
  }

  static async first(fields?: string | string[]): Promise<{} | null> {
    try {
      if (fields) this.select(fields);

      const aggregate = this.aggregate();
      this.resetQuery();
      this.resetRelation();

      return await aggregate.next();
    } catch (error) {
      throw error;
    }
  }

  static async find(id: string | ObjectId): Promise<{} | null> {
    try {
      let _id = id;

      if (typeof _id === "string") _id = new ObjectId(_id);

      this.where("_id", _id);
      const aggregate = this.aggregate();
      this.resetQuery();
      this.resetRelation();

      return await aggregate.next();
    } catch (error) {
      throw error;
    }
  }

  static async paginate(
    page: number = 1,
    perPage: number = this.perPage
  ): Promise<PaginateInterface> {
    try {
      const aggregate = this.aggregate();
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

  protected static aggregate() {
    try {
      const collection = this.getCollection();
      const _pipeline = [];
      this.generateQuery();
      _pipeline.push(this.queries);

      if (
        Object.entries(
          (this?.sorts?.[1] as { $sort?: Record<string, any> })?.$sort || {}
        ).length > 0
      )
        _pipeline.push(...this.sorts);

      if (
        Object.entries(
          (this?.fields?.[0] as { $project?: Record<string, any> })?.$project ||
            {}
        ).length > 1 ||
        this.fields.length > 1
      ) {
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

      return aggregate?.max || 0;
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

      return aggregate?.min || 0;
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

      return aggregate.map((item) => item[field]);
    } catch (error) {
      throw error;
    }
  }

  static async create(payload: object): Promise<object> {
    try {
      const collection = this.getCollection();

      let _payload: object = checkSoftDelete(this.softDelete, payload);
      _payload = checkTimestamps(this.timestamps, _payload);

      const data = await collection.insertOne({
        ..._payload,
      });

      return { _id: data.insertedId, ...payload };
    } catch (error) {
      throw error;
    }
  }

  static async update(payload: object): Promise<object> {
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
      return data || {};
    } catch (error) {
      throw error;
    }
  }

  static async delete(): Promise<object> {
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

        return {
          deletedCount: _data.modifiedCount,
        };
      }

      this.resetQuery();
      const _data = await collection.deleteMany(q);

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
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default Model;

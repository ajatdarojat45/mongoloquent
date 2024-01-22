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

      const aggregate = await this.aggregate();
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

      const aggregate = await this.aggregate();
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
      const aggregate = await this.aggregate();
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
      const aggregate = await this.aggregate();
      const collection = await this.getCollection();
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
      const collection = await this.getCollection();

      const _pipeline = [];

      this.generateQuery();
      _pipeline.push(this.queries);

      if (
        Object.entries(
          (this?.sort?.[1] as { $sort?: Record<string, any> })?.$sort || {}
        ).length > 0
      )
        _pipeline.push(...this.sort);

      if (
        Object.entries(
          (this?.fields?.[0] as { $project?: Record<string, any> })?.$project ||
            {}
        ).length > 1 ||
        this.fields.length > 1
      ) {
        _pipeline.push(...this.fields);
      }

      if (this.lookup.length > 0) _pipeline.push(...this.lookup);

      _pipeline.push({
        $project: {
          document: 0,
        },
      });

      if (this.limit > 0) _pipeline.push({ $limit: this.limit });

      return collection.aggregate([..._pipeline]);
    } catch (error) {
      throw error;
    }
  }

  static async create(payload: object): Promise<object> {
    try {
      const collection = await this.getCollection();

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
      const collection = await this.getCollection();
      const _payload = checkTimestamps(this.timestamps, payload);

      if ((_payload as any)?._id) delete (_payload as any)._id;

      if ((_payload as any)?._createdAt) delete (_payload as any).createdAt;

      const data = await collection.findOneAndUpdate(
        this.queries,
        {
          $set: {
            ..._payload,
          },
        },
        {
          returnDocument: "after",
        }
      );

      return data || {};
    } catch (error) {
      throw error;
    }
  }

  static async delete(): Promise<object | null> {
    try {
      if (this.softDelete) {
        return await this.update({
          isDeleted: true,
          deletedAt: dayjs().toDate(),
        });
      }

      return await this.forceDelete();
    } catch (error) {
      throw error;
    }
  }

  static async forceDelete(): Promise<object | null> {
    try {
      const collection = await this.getCollection();

      this.generateQuery();

      if (Object.keys(this?.queries?.$match || {}).length > 0) {
        const q = this?.queries?.$match || {};
        return await collection.findOneAndDelete(q);
      }

      return null;
    } catch (error) {
      throw error;
    }
  }
}

export default Model;

const Relation = require("./Relation");
const dayjs = require("../utils/dayjs");
const checkTimestamps = require("../helpers/checkTimestamps");
const checkSoftDelete = require("../helpers/checkSoftDelete");

class Model extends Relation {
  static async get(fields = []) {
    try {
      if (fields.length > 0) this.select(fields);

      const aggregate = await this.aggregate();
      this.resetQuery();
      this.resetRelation();

      return await aggregate.toArray();
    } catch (error) {
      throw error;
    }
  }

  static async first() {
    try {
      const aggregate = await this.aggregate();
      this.resetQuery();
      this.resetRelation();

      return await aggregate.next();
    } catch (error) {
      throw error;
    }
  }

  static async paginate(page = 1, perPage = this.perPage) {
    try {
      const aggregate = await this.aggregate();
      const collection = await this.getCollection();
      const { total } = await collection
        .aggregate([
          this.queries,
          {
            $count: "total",
          },
        ])
        .next();

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

  static async aggregate() {
    try {
      const collection = await this.getCollection();

      const _pipeline = [];

      this.generateQuery();
      _pipeline.push(this.queries);

      if (Object.entries(this.sort[1].$sort).length > 0)
        _pipeline.push(...this.sort);

      if (Object.entries(this.fields.$project).length > 0)
        _pipeline.push(this.fields);

      if (this.lookup.length > 0) _pipeline.push(...this.lookup);

      if (this.limit > 0) _pipeline.push({ $limit: this.limit });

      return await collection.aggregate(_pipeline);
    } catch (error) {
      throw error;
    }
  }

  static async create(payload) {
    try {
      const collection = await this.getCollection();

      let _payload = checkSoftDelete(this.softDelete, payload);
      _payload = checkTimestamps(this.timestamps, _payload);

      const data = await collection.insertOne({
        ..._payload,
      });

      return { _id: data.insertedId, ...this.payload };
    } catch (error) {
      throw error;
    }
  }

  static async update(payload) {
    try {
      const collection = await this.getCollection();
      const _payload = checkTimestamps(this.timestamps, payload);
      const { _id, createdAt, ...rest } = _payload;

      const data = await collection.findOneAndUpdate(
        this.queries,
        {
          $set: {
            ...rest,
          },
        },
        {
          returnDocument: "after",
          returnNewDocument: true,
        }
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async delete() {
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

  static async forceDelete() {
    try {
      const collection = await this.getCollection();

      const data = await collection.findOneAndDelete(this.condition);

      return data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Model;

const mongorm = require("../config/mongorm");
const dayjs = require("../config/dayjs");

class Model {
  static collection = "collection";
  static softDelete = false;
  static timestamps = false;
  static condition = {};
  static sort = {};
  static limit = 0;
  static _payload = {};
  static withTrashed = false;
  static onlyTrashed = false;

  static async getCollection() {
    const db = await mongorm();
    return db.collection(this.collection);
  }

  static async cursor() {
    try {
      const collection = await this.getCollection();

      let _condition = this.condition;

      if (this.softDelete) {
        _condition = {
          ..._condition,
          isDeleted: false,
        };
      }

      if (this.onlyTrashed) {
        _condition = {
          ..._condition,
          isDeleted: true,
        };
      }

      if (this.withTrashed) {
        const { isDeleted, ...rest } = _condition;

        _condition = {
          ...rest,
        };
      }

      const cursor = await collection
        .find(this.condition)
        .sort(this.sort)
        .limit(this.limit);

      if (this.onlyTrashed) this.onlyTrashed = false;
      if (this.withTrashed) this.withTrashed = false;

      return cursor;
    } catch (error) {
      throw error;
    }
  }

  static async get() {
    try {
      const cursor = await this.cursor();
      const result = await cursor.toArray();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async first() {
    try {
      const cursor = await this.cursor();
      const result = await cursor.next();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async paginate(page = 1, perPage = 10) {
    try {
      const cursor = await this.cursor();
      const total = await cursor.count();
      const result = await cursor
        .skip((page - 1) * perPage)
        .limit(perPage)
        .toArray();

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

  static async create(payload) {
    try {
      const collection = await this.getCollection();
      this.payload = payload;

      this.checkTimestamps();
      this.checkSoftDelete();

      const data = await collection.insertOne({
        ...this.payload,
      });

      return { _id: data.insertedId, ...this.payload };
    } catch (error) {
      throw error;
    }
  }

  static async update(payload) {
    try {
      const collection = await this.getCollection();
      this.payload = payload;

      this.checkTimestamps();

      const { _id, createdAt, ...rest } = this.payload;

      const data = await collection.findOneAndUpdate(
        this.condition,
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
      const collection = await this.getCollection();

      if (this.softDelete) {
        return await this.update({ isDeleted: true });
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

  static where(key, value) {
    this.condition = {
      ...this.condition,
      [key]: value,
    };
    return this;
  }

  static orderBy(criteria, order) {
    const _criteria = criteria.toLowerCase();
    const _order = order.toLowerCase() === "desc" ? -1 : 1;

    this.sort = {
      [criteria]: _order,
    };
    return this;
  }

  static take(limit) {
    this.limit = limit;
    return this;
  }

  static withTrashed() {
    this.withTrashed = true;
    return this;
  }

  static onlyTrashed() {
    this.onlyTrashed = true;
    return this;
  }

  static checkTimestamps() {
    if (this.timestamps) {
      const now = dayjs().toDate();
      this.payload = { ...this.payload, createdAt: now, updatedAt: now };
    }
  }

  static checkSoftDelete() {
    if (this.softDelete) {
      this.payload = { ...this.payload, isDeleted: false };
    }
  }
}

module.exports = Model;

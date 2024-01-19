const Relation = require("./Relation");
const Query = require("./Query");
const mongodb = require("./connectors/mongodb");
const dayjs = require("../utils/dayjs");
const checkTimestamps = require("../helpers/checkTimestamps");
const checkSoftDelete = require("../helpers/checkSoftDelete");

class Model {
  static collection = "collection";
  static softDelete = false;
  static timestamps = false;
  static withTrashed = false;
  static onlyTrashed = false;
  static condition = [];
  static sort = [];
  static limit = 0;
  static lookup = [];
  static perPage = 10;
  static selectedFields = [];

  static async getCollection() {
    const db = await mongodb();
    return db.collection(this.collection);
  }

  static async get(fields = []) {
    try {
      if (fields.length > 0) this.selectedFields = fields;

      const aggregate = await this.aggregate();
      return await aggregate.toArray();
    } catch (error) {
      throw error;
    }
  }

  static async first() {
    try {
      const aggregate = await this.aggregate();
      return await aggregate.next();
    } catch (error) {
      throw error;
    }
  }

  static async paginate(page = 1, perPage = this.perPage) {
    try {
      const aggregate = await this.aggregate();
      const _condition = this.getCondition();
      const collection = await this.getCollection(_condition);
      const { total } = await collection
        .aggregate([
          _condition,
          {
            $count: "total",
          },
        ])
        .next();

      const result = await aggregate
        .skip((page - 1) * perPage)
        .limit(perPage)
        .toArray();

      if (this.onlyTrashed) this.onlyTrashed = false;
      if (this.withTrashed) this.withTrashed = false;
      if (this.lookup.length > 0) this.lookup = [];

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

  static async aggregate() {
    try {
      const collection = await this.getCollection();

      let _condition = this.getCondition();

      const _sort = Query.orderBy(this.sort);

      const _pipeline = [..._sort, _condition];

      if (this.selectedFields.length > 0) {
        const _fields = Query.selectedFields(this.selectedFields);

        _pipeline.push(_fields);
      }

      if (this.lookup.length > 0) _pipeline.push(...this.lookup);

      if (this.limit > 0) _pipeline.push({ $limit: this.limit });

      const data = await collection.aggregate(_pipeline);

      if (this.onlyTrashed) this.onlyTrashed = false;
      if (this.withTrashed) this.withTrashed = false;
      if (this.lookup.length > 0) this.lookup = [];
      if (this.limit > 0) this.limit = 0;
      if (this.sort.length > 0) this.sort = [];
      if (this.selectedFields.length > 0) this.selectedFields = [];

      return data;
    } catch (error) {
      throw error;
    }
  }

  static with(method) {
    const model = this[method]();
    this.lookup = Relation.with(model, method, this.lookup);
    return this;
  }

  static belongsTo(collection, foreignKey, localKey = "_id") {
    return Relation.belongsTo(collection, foreignKey, localKey);
  }

  static hasMany(collection, foreignKey, localKey = "_id") {
    return Relation.hasMany(collection, foreignKey, localKey);
  }

  static getCondition() {
    const criteria = {
      softDelete: this.softDelete,
      onlyTrashed: this.onlyTrashed,
      withTrashed: this.withTrashed,
    };

    return Query.buildCondition(this.condition, criteria);
  }

  static where(field, operator, value = "") {
    let _value = value;
    let _operator = operator;

    if (value === "") {
      _value = operator;
      _operator = "eq";
    }

    this.condition.push({
      field,
      operator: _operator,
      value: _value,
      logic: "and",
    });

    return this;
  }

  static orWhere(field, operator, value = "") {
    let _value = value;
    let _operator = operator;

    if (value === "") {
      _value = operator;
      _operator = "eq";
    }

    this.condition.push({
      field,
      operator: _operator,
      value: _value,
      logic: "or",
    });

    return this;
  }

  static orderBy(field = "_id", order = "asc") {
    this.sort.push({
      field,
      order,
    });
    return this;
  }

  static take(limit) {
    this.limit = limit;
    return this;
  }

  static select(fields = []) {
    this.selectedFields = fields;
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
}

module.exports = Model;

import { ObjectId } from "mongodb";

export interface IMongoloquentSchema {
  _id: ObjectId;
}

export interface IMongoloquentTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface IMongoloquentSoftDelete {
  deletedAt: Date;
  isDeleted: boolean;
}

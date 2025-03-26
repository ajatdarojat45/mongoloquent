import { ObjectId } from "mongodb";

export interface IMongoloquentSchema
  extends IMongoloquentTimestamps,
    IMongoloquentSoftDelete {
  _id: ObjectId;
}

interface IMongoloquentTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface IMongoloquentSoftDelete {
  deletedAt: Date;
  isDeleted: boolean;
}

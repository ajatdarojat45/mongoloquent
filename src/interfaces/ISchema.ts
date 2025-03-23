import { ObjectId } from "mongodb";

export interface IMongoloquentSchema {
    _id: ObjectId
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    isDeleted: boolean;
}
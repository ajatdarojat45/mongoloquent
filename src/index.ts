import "dotenv/config";
import Model from "./Model";

export const Mongoloquent = Model;

export interface IMongoloquentSchema {
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    isDeleted?: boolean;
}
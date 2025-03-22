import { describe, it } from "@jest/globals";
import { ObjectId, WithId } from "mongodb";
import { expectTypeOf } from "expect-type";
import Model from "../../../src/Model";
import { IMongoloquentSchema } from "../../../src/index";

// Define interface for User
interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
  age: number;
  old: boolean;
}

// Define User model extending from Model
class User extends Model {
  static $schema: IUser;
  static $collection = "users";
}

// Test Model
describe("Model Typesafety", () => {
  it("Model.updateMany", async () => {
    const users = await User.insertMany([
      { name: "John", email: "John", age: 10, old: false },
      { name: "Jane", email: "Jane", age: 20, old: false },
    ]);

    const updatedUsers = await User.where("age", ">", 10).updateMany({
      old: true,
    });
    expectTypeOf(updatedUsers).toEqualTypeOf<number>();
  });
});

import { describe, it } from "@jest/globals";
import { ObjectId, WithId } from "mongodb";
import { expectTypeOf } from "expect-type";
import Model from "../../../src/Model";
import { IMongoloquentSchema } from "../../../src/index";

// Define interface for User
interface IUser extends IMongoloquentSchema {
  name: string;
  email: string;
}

// Define User model extending from Model
class User extends Model {
  static $schema: IUser;
  static $collection = "users";
}

// Test Model
describe("Model Typesafety", () => {
  it("Model.insertMany", async () => {
    const users = await User.insertMany([
      {name: "John", email: "John"},
      {name: "Jane", email: "Jane"},
    ]);
    expectTypeOf(users).toEqualTypeOf<ObjectId[]>();
  });
});

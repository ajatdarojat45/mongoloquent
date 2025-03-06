import { describe, expect, it } from "@jest/globals";
import { WithId } from "mongodb";
import { expectTypeOf } from "expect-type";
import Model from "../../src/Model";

// Define interface for User
interface IUser {
  name: string;
}

// Define User model extending from Model
class User extends Model {
  static $schema: WithId<IUser>;
  static $collection = "users";
}

// Test Model
describe("Model Typesafety", () => {
  it("Model.all", async () => {
    const users = await User.all();
    expectTypeOf(users).toEqualTypeOf<WithId<IUser>[]>();
  });

  it("Model.first", async () => {
    const user = await User.first();
    expectTypeOf(user).toEqualTypeOf<WithId<IUser> | null>();
  });

  it("Model.get string column", async () => {
    const user = await User.get("_id");
    expectTypeOf(user).toEqualTypeOf<WithId<IUser>[]>();
  });

  it("Model.get string[] columns", async () => {
    const user = await User.get(["_id", "name"]);
    expectTypeOf(user).toEqualTypeOf<WithId<IUser>[]>();
  });
});

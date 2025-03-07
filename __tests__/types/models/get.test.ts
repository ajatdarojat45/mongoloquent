import { describe, it } from "@jest/globals";
import { WithId } from "mongodb";
import { expectTypeOf } from "expect-type";
import Model from "../../../src/Model";

// Define interface for User
interface IUser {
  name: string;
  email: string;
}

// Define User model extending from Model
class User extends Model {
  static $schema: WithId<IUser>;
  static $collection = "users";
}

// Test Model
describe("Model Typesafety", () => {
  describe("Model.get", () => {
    it("Model.get with no columns", async () => {
      const user = await User.get();
      expectTypeOf(user).toEqualTypeOf<WithId<IUser>[]>();
    });
    it("Model.get with string column", async () => {
      const user = await User.get("_id");

      expectTypeOf(user).toEqualTypeOf<Pick<WithId<IUser>, "_id">[]>();
    });
    it("Model.get with string column", async () => {
      const user = await User.get("name");

      expectTypeOf(user).toEqualTypeOf<Pick<WithId<IUser>, "name">[]>();
    });
    it("Model.get with 1 element of array columns", async () => {
      const user = await User.get(["_id"]);

      expectTypeOf(user).toEqualTypeOf<Pick<WithId<IUser>, "_id">[]>();
    });
    it("Model.get with 2 elements of array columns", async () => {
      const user = await User.get(["_id", "name"]);

      expectTypeOf(user).toEqualTypeOf<Pick<WithId<IUser>, "name" | "_id">[]>();
    });
  });
});

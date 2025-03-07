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
  describe("Model.first", () => {
    it("Model.first with no columns", async () => {
      const user = await User.first();
      expectTypeOf(user).toEqualTypeOf<WithId<IUser> | null>();
    });
    it("Model.first with string column", async () => {
      const user = await User.first("_id");

      expectTypeOf(user).toEqualTypeOf<Pick<WithId<IUser>, "_id"> | null>();
    });
    it("Model.first with string column", async () => {
      const user = await User.first("name");

      expectTypeOf(user).toEqualTypeOf<Pick<WithId<IUser>, "name"> | null>();
    });
    it("Model.first with 1 element of array columns", async () => {
      const user = await User.first(["_id"]);

      expectTypeOf(user).toEqualTypeOf<Pick<WithId<IUser>, "_id"> | null>();
    });
    it("Model.first with 2 elements of array columns", async () => {
      const user = await User.first(["_id", "name"]);

      expectTypeOf(user).toEqualTypeOf<Pick<
        WithId<IUser>,
        "name" | "_id"
      > | null>();
    });
  });
});

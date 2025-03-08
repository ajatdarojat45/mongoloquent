import { describe, it } from "@jest/globals";
import { WithId } from "mongodb";
import { expectTypeOf } from "expect-type";
import Model from "../../../src/Model";

// Define interface for User
interface IUser {
  name: string;
  email: string;
  age: number;
}

// Define User model extending from Model
class User extends Model {
  static $schema: WithId<IUser>;
  static $collection = "users";
}

// Test Model
describe("Model Typesafety", () => {
  describe("Model.pluck", () => {
    it("Model.pluck with _id column", async () => {
      const user = await User.pluck("_id");

      type Expected = typeof User['$schema']['_id']
      expectTypeOf(user).toEqualTypeOf<Expected[]>();
    });
    it("Model.pluck with name column", async () => {
      const user = await User.pluck("name");

      type Expected = typeof User['$schema']['name']
      expectTypeOf(user).toEqualTypeOf<Expected[]>();
    });
    it("Model.pluck with age column", async () => {
      const user = await User.pluck("age");

      type Expected = typeof User['$schema']['age']
      expectTypeOf(user).toEqualTypeOf<Expected[]>();
    });
  });
});

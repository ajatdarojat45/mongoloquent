import { describe, it } from "@jest/globals";
import { WithId } from "mongodb";
import { expectTypeOf } from "expect-type";
import Model from "../../../src/Model";
import { IModelPaginate } from "../../../src/interfaces/IModel";

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
  describe("Model.paginate", () => {
    it("Model.paginate", async () => {
      const user = await User.paginate(1, 2);
      expectTypeOf(user).toEqualTypeOf<IModelPaginate<WithId<IUser>>>();
    });
    it("Model.paginate with select", async () => {
      const user = await User.select(["_id", "email"]).paginate(1, 2);
      expectTypeOf(user).toEqualTypeOf<IModelPaginate<WithId<IUser>>>();
    });
  });
});

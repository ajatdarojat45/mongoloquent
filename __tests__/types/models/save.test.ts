import { describe, it } from "@jest/globals";
import { WithId } from "mongodb";
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
  it("Model.save", async () => {
    const user = await User.save({
      name: "John",
      email: "Doe",
    });
    expectTypeOf(user).toEqualTypeOf<WithId<IUser>>();
  });
});

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
});

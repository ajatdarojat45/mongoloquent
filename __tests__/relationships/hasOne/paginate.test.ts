import { ObjectId } from "mongodb";

import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("users").getCollection().deleteMany({});
  await DB.collection("phones").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("users").getCollection().deleteMany({});
  await DB.collection("phones").getCollection().deleteMany({});
});

describe("paginate method", () => {
  describe("without soft delete", () => {
    interface IUser extends IMongoloquentSchema {
      name: string;
      phone?: IPhone;
    }

    interface IPhone extends IMongoloquentSchema {
      number: string;
      countryCode: string;
      userId: ObjectId;
      likes?: number;
    }

    class User extends Model<IUser> {
      static $collection: string = "users";
      static $schema: IUser;

      phone() {
        return this.hasOne(Phone);
      }
    }

    class Phone extends Model<IPhone> {
      static $collection: string = "phones";
      static $schema: IPhone;
    }

    it("return all documents", async () => {
      const userIds = await User.insertMany([
        { name: "Udin" },
        { name: "Kosasih" },
      ]);

      const phoneIds = await Phone.insertMany([
        { number: "1234567890", countryCode: "+62", userId: userIds[0] },
        { number: "0987654321", countryCode: "+62", userId: userIds[1] },
      ]);

      const user = await User.find(userIds[0]);
      const phone = await user.phone().paginate();
      expect(phone).toBeDefined();
      expect(phone.data).toBeDefined();
      expect(phone.data.length).toBe(1);
    });
  });

  describe("with soft delete", () => {
    interface IUser extends IMongoloquentSchema, IMongoloquentSoftDelete {
      name: string;
      phone?: IPhone;
    }

    interface IPhone extends IMongoloquentSchema, IMongoloquentSoftDelete {
      number: string;
      countryCode: string;
      userId: ObjectId;
      likes: number;
    }

    class User extends Model<IUser> {
      static $collection: string = "users";
      static $schema: IUser;

      phone() {
        return this.hasOne(Phone);
      }
    }

    class Phone extends Model<IPhone> {
      static $collection: string = "phones";
      static $schema: IPhone;
      static $useSoftDelete: boolean = true;
    }

    it("return all documents", async () => {
      const userIds = await User.insertMany([
        { name: "Udin" },
        { name: "Kosasih" },
      ]);

      const phoneIds = await Phone.insertMany([
        {
          number: "1234567890",
          countryCode: "+62",
          userId: userIds[0],
          likes: 10,
        },
        {
          number: "0987654321",
          countryCode: "+62",
          userId: userIds[1],
          likes: 20,
        },
      ]);

      await Phone.destroy(phoneIds[0]);

      const user = await User.find(userIds[0]);
      const phone = await user.phone().paginate();
      expect(phone).toBeDefined();
      expect(phone.data).toBeDefined();
      expect(phone.data.length).toBe(0);

      const phone2 = await user.phone().withTrashed().paginate();
      expect(phone2).toBeDefined();
      expect(phone2.data).toBeDefined();
      expect(phone2.data.length).toBe(1);
    });
  });
});

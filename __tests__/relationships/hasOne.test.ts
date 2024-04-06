import Model from "../../src/database/Model";

class User extends Model {
  static collection = "users";
  static timestamps = true;
  static softDelete = true;

  static phone() {
    return this.hasOne(Phone, "userId", "_id");
  }
}

class Phone extends Model {
  static collection = "phones";
  static timestamps = true;
  static softDelete = true;

  static user() {
    return this.belongsTo(User, "userId", "_id");
  }
}

beforeAll(async () => {
  const userIds = await User.insertMany([
    {
      name: "Udin",
    },
    {
      name: "Kosasih",
    },
    {
      name: "Jhon",
    },
  ]);

  await Phone.insertMany([
    {
      number: "08123456789",
      userId: userIds[0],
    },
    {
      number: "08987654321",
      userId: userIds[1],
    },
  ]);
});

afterAll(async () => {
  const userCollection = User["getCollection"]();
  const phoneCollection = Phone["getCollection"]();

  await userCollection.deleteMany({});
  await phoneCollection.deleteMany({});
});

describe("hasOne Relation", () => {
  it("Should return related data", async () => {
    const { data }: any = await User.with("phone")
      .where("name", "Udin")
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(data).toHaveProperty("phone");
    expect(data.phone).toEqual(expect.any(Object));
    expect(data.phone).toHaveProperty("userId", data._id);
  });

  it("with selected fields", async () => {
    const { data }: any = await User.with("phone", {
      select: ["number"],
    })
      .where("name", "Udin")
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(data).toHaveProperty("phone");
    expect(data.phone).toEqual(expect.any(Object));
    expect(data.phone).toHaveProperty("number");
    expect(data.phone).not.toHaveProperty("_id");
    expect(data.phone).not.toHaveProperty("userId");
  });

  it("with excluded fields", async () => {
    const { data }: any = await User.with("phone", {
      exclude: ["number"],
    })
      .where("name", "Udin")
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(data).toHaveProperty("phone");
    expect(data.phone).toEqual(expect.any(Object));
    expect(data.phone).not.toHaveProperty("number");
    expect(data.phone).toHaveProperty("_id");
    expect(data.phone).toHaveProperty("userId");
  });

  it("with has no related data", async () => {
    const { data }: any = await User.with("phone")
      .where("name", "Jhon")
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(data).not.toHaveProperty("phone");
  });

  it("with softDelete should be has no related data", async () => {
    await Phone.where("number", "08123456789").delete();

    const { data }: any = await User.with("phone")
      .where("name", "Udin")
      .first();

    const { data: phone } = await Phone.where("number", "08123456789")
      .withTrashed()
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(phone).toEqual(expect.any(Object));
    expect(phone).toHaveProperty("userId", data._id);
  });

  it("belongsTo - Should return related data", async () => {
    const { data }: any = await Phone.with("user")
      .where("number", "08987654321")
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(data).toHaveProperty("user");
    expect(data.user).toEqual(expect.any(Object));
  });

  it("belongsTo - with selected fields", async () => {
    const { data }: any = await Phone.with("user", {
      select: ["name"],
    })
      .where("number", "08987654321")
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(data).toHaveProperty("user");
    expect(data.user).toEqual(expect.any(Object));
    expect(data.user).toHaveProperty("name");
    expect(data.user).not.toHaveProperty("_id");
  });

  it("belongsTo - with excluded fields", async () => {
    const { data }: any = await Phone.with("user", {
      exclude: ["name"],
    })
      .where("number", "08987654321")
      .first();

    expect(data).toEqual(expect.any(Object));
    expect(data).toHaveProperty("user");
    expect(data.user).toEqual(expect.any(Object));
    expect(data.user).not.toHaveProperty("name");
    expect(data.user).toHaveProperty("_id");
  });
});

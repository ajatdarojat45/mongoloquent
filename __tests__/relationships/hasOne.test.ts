import Model from "../../src/Model";

class User extends Model {
  static $collection = "users";
  static $useTimestamps = true;
  static $useSoftDelete = true;

  static phone() {
    return this.hasOne(Phone, "userId", "_id");
  }
}

class Phone extends Model {
  static $collection = "phones";
  static $useTimestamps = true;
  static $useSoftDelete = true;

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
    const user = await User.with("phone").where("name", "Udin").first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("phone");
    expect(user?.phone).toEqual(expect.any(Object));
    expect(user?.phone).toHaveProperty("userId", user?._id);
  });

  it("with selected fields", async () => {
    const user = await User.with("phone", {
      select: ["number"],
    })
      .where("name", "Udin")
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("phone");
    expect(user?.phone).toEqual(expect.any(Object));
    expect(user?.phone).toHaveProperty("number");
    expect(user?.phone).not.toHaveProperty("_id");
    expect(user?.phone).not.toHaveProperty("userId");
  });

  it("with excluded fields", async () => {
    const user = await User.with("phone", {
      exclude: ["number"],
    })
      .where("name", "Udin")
      .first();

    expect(user).toEqual(expect.any(Object));
    expect(user).toHaveProperty("phone");
    expect(user?.phone).toEqual(expect.any(Object));
    expect(user?.phone).not.toHaveProperty("number");
    expect(user?.phone).toHaveProperty("_id");
    expect(user?.phone).toHaveProperty("userId");
  });

  it("with has no related data", async () => {
    const user = await User.with("phone").where("name", "Jhon").first();

    expect(user).toEqual(expect.any(Object));
    expect(user).not.toHaveProperty("phone");
  });

  it("with softDelete should be has no related data", async () => {
    await Phone.where("number", "08123456789").delete();

    const user = await User.with("phone").where("name", "Udin").first();

    const phone = await Phone.where("number", "08123456789")
      .withTrashed()
      .first();

    expect(phone).toEqual(expect.any(Object));
    expect(phone).toEqual(expect.any(Object));
    expect(phone).toHaveProperty("userId", user?._id);
  });

  it("belongsTo - Should return related data", async () => {
    const phone = await Phone.with("user")
      .where("number", "08987654321")
      .first();

    expect(phone).toEqual(expect.any(Object));
    expect(phone).toHaveProperty("user");
    expect(phone?.user).toEqual(expect.any(Object));
  });

  it("belongsTo - with selected fields", async () => {
    const phone = await Phone.with("user", {
      select: ["name"],
    })
      .where("number", "08987654321")
      .first();

    expect(phone).toEqual(expect.any(Object));
    expect(phone).toHaveProperty("user");
    expect(phone?.user).toEqual(expect.any(Object));
    expect(phone?.user).toHaveProperty("name");
    expect(phone?.user).not.toHaveProperty("_id");
  });

  it("belongsTo - with excluded fields", async () => {
    const phone = await Phone.with("user", {
      exclude: ["name"],
    })
      .where("number", "08987654321")
      .first();

    expect(phone).toEqual(expect.any(Object));
    expect(phone).toHaveProperty("user");
    expect(phone?.user).toEqual(expect.any(Object));
    expect(phone?.user).not.toHaveProperty("name");
    expect(phone?.user).toHaveProperty("_id");
  });
});

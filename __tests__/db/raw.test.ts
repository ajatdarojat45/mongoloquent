import DB from "../../src/DB";

beforeEach(async () => {
  await DB.collection("users").getCollection().deleteMany({});
  await DB.collection("posts").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("users").getCollection().deleteMany({});
  await DB.collection("posts").getCollection().deleteMany({});
});

describe("raw", () => {
  it("should create a  stage", async () => {
    const userIds = await DB.collection("users").insertMany([
      { name: "John Doe", age: 30 },
      { name: "Jane Doe", age: 25 },
    ]);

    const postIds = await DB.collection("posts").insertMany([
      { title: "Post 1", userId: userIds[0] },
      { title: "Post 2", userId: userIds[1] },
    ]);

    const users = await DB.collection<any>("users")
      .raw({
        $project: {
          name: 1,
        },
      })
      .get();

    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty("name");
    expect(users[0]).not.toHaveProperty("age");
  });

  it("should create a  stage", async () => {
    const userIds = await DB.collection("users").insertMany([
      { name: "John Doe", age: 30 },
      { name: "Jane Doe", age: 25 },
    ]);

    const postIds = await DB.collection("posts").insertMany([
      { title: "Post 1", userId: userIds[0] },
      { title: "Post 2", userId: userIds[1] },
    ]);

    const users = await DB.collection<any>("users")
      .raw([
        {
          $project: {
            name: 1,
          },
        },
      ])
      .get();

    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty("name");
    expect(users[0]).not.toHaveProperty("age");
  });
});

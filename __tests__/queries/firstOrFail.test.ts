import { ObjectId } from "mongodb";

import Model from "../../src/Model";
import { MongoloquentNotFoundException } from "../../src/exceptions/MongoloquentException";

interface ITestModel {
  name: string;
  value: number;
}

class TestModel extends Model<ITestModel> {
  protected $collection = "testCollection";
  static $schema: ITestModel;
}

const query = TestModel["query"]();
const testCollection = query["getCollection"]();

let documentId: ObjectId;

beforeAll(async () => {
  // Insert a test document
  const result: any = await TestModel.insert({
    name: "Test Document",
    value: 42,
  });
  documentId = result?._id;
});

afterAll(async () => {
  // Clean up the test collection
  await testCollection?.deleteMany({});
});

describe("Model.firstOrFail", () => {
  it("Should return the first document that matches the query criteria", async () => {
    const document = await TestModel.where(
      "name",
      "Test Document",
    ).firstOrFail();
    expect(document).toEqual(expect.any(Object));
    expect(document).toHaveProperty("_id", documentId);
    expect(document).toHaveProperty("name", "Test Document");
    expect(document).toHaveProperty("value", 42);
  });

  it("Should throw ModelNotFoundException if no document matches the query criteria", async () => {
    await expect(
      TestModel.where("name", "Nonexistent Document").firstOrFail(),
    ).rejects.toThrow(MongoloquentNotFoundException);
  });

  it("Should return the first document with specified column", async () => {
    const document = await TestModel.where("name", "Test Document").firstOrFail(
      "name",
    );
    expect(document).toEqual(expect.any(Object));
    expect(document).toHaveProperty("_id", documentId);
    expect(document).toHaveProperty("name", "Test Document");
    expect(document).not.toHaveProperty("value");
  });

  it("Should return the first document with specified columns", async () => {
    const document = await TestModel.where("name", "Test Document").firstOrFail(
      ["name", "value"],
    );
    expect(document).toEqual(expect.any(Object));
    expect(document).toHaveProperty("_id", documentId);
    expect(document).toHaveProperty("name", "Test Document");
    expect(document).toHaveProperty("value");
  });

  it("Should throw ModelNotFoundException if no document matches the query criteria with specified columns", async () => {
    await expect(
      TestModel.where("name", "Nonexistent Document").firstOrFail(["name"]),
    ).rejects.toThrow(MongoloquentNotFoundException);
  });
});

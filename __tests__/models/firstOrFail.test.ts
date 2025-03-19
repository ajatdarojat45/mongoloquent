import { ObjectId } from "mongodb";
import Model from "../../src/Model";
import ModelNotFoundException from "../../src/exceptions/ModelNotFoundException";

class TestModel extends Model {
  static $collection = "testCollection";
}

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
  const collection = TestModel["getCollection"]();
  await collection.deleteMany({});
});

describe("Model.firstOrFail", () => {
  it("Should return the first document that matches the query criteria", async () => {
    const document = await TestModel.where(
      "name",
      "Test Document"
    ).firstOrFail();
    expect(document).toEqual(expect.any(Object));
    expect(document).toHaveProperty("_id", documentId);
    expect(document).toHaveProperty("name", "Test Document");
    expect(document).toHaveProperty("value", 42);
  });

  it("Should throw ModelNotFoundException if no document matches the query criteria", async () => {
    await expect(
      TestModel.where("name", "Nonexistent Document").firstOrFail()
    ).rejects.toThrow(ModelNotFoundException);
  });

  it("Should return the first document with specified column", async () => {
    const document = await TestModel.where("name", "Test Document").firstOrFail(
      "name"
    );
    expect(document).toEqual(expect.any(Object));
    expect(document).toHaveProperty("_id", documentId);
    expect(document).toHaveProperty("name", "Test Document");
    expect(document).not.toHaveProperty("value");
  });

  it("Should return the first document with specified columns", async () => {
    const document = await TestModel.where("name", "Test Document").firstOrFail(
      ["name", "value"]
    );
    expect(document).toEqual(expect.any(Object));
    expect(document).toHaveProperty("_id", documentId);
    expect(document).toHaveProperty("name", "Test Document");
    expect(document).toHaveProperty("value");
  });

  it("Should throw ModelNotFoundException if no document matches the query criteria with specified columns", async () => {
    await expect(
      TestModel.where("name", "Nonexistent Document").firstOrFail(["name"])
    ).rejects.toThrow(ModelNotFoundException);
  });
});

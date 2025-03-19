import { MongoClient, Db, Collection } from "mongodb";
import Database from "../../src/Database";
import {
  MONGOLOQUENT_DATABASE_NAME,
  MONGOLOQUENT_DATABASE_URI,
} from "../../src/configs/app";

jest.mock("mongodb");

describe("Database", () => {
  let mockDb: Db;
  let mockCollection: Collection;
  let mockClient: MongoClient;

  beforeEach(() => {
    mockCollection = {} as Collection;
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as Db;

    mockClient = {
      connect: jest.fn(),
      db: jest.fn().mockReturnValue(mockDb),
    } as unknown as MongoClient;

    (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getDb should return the MongoDB database", () => {
    const db = Database["getDb"]();
    expect(db).toBe(mockDb);
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.db).toHaveBeenCalledWith(MONGOLOQUENT_DATABASE_NAME);
  });

  test("getConnectionName should return the connection URI", () => {
    expect(Database["getConnectionName"]()).toBe(MONGOLOQUENT_DATABASE_URI);
  });

  test("getDatabaseName should return the database name", () => {
    expect(Database["getDatabaseName"]()).toBe(MONGOLOQUENT_DATABASE_NAME);
  });

  test("getCollection should return the MongoDB collection", () => {
    const collectionName = "testCollection";
    Database.$collection = collectionName;
    const collection = Database["getCollection"]();
    expect(collection).toStrictEqual(mockCollection);
  });

  test("getDbs should return the map of connected databases", () => {
    const dbs = Database["getDbs"]();
    expect(dbs).toBeInstanceOf(Map);
  });

  test("connect should establish a connection to the MongoDB database", () => {
    const db = Database["connect"]();
    expect(db).toBe(mockDb);
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.db).toHaveBeenCalledWith(MONGOLOQUENT_DATABASE_NAME);
  });

  test("connect should throw an error if connection fails", () => {
    mockClient.connect = jest.fn(() => {
      throw new Error("Connection failed");
    });
    expect(() => Database["connect"]()).toThrow(
      "Mongoloquent failed to connect to MongoDB database."
    );
  });
});

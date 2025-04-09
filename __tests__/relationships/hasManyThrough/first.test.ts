import { ObjectId } from "mongodb";

import DB from "../../../src/DB";
import Model from "../../../src/Model";
import {
  IMongoloquentSchema,
  IMongoloquentSoftDelete,
} from "../../../src/interfaces/ISchema";

beforeEach(async () => {
  await DB.collection("applications").getCollection().deleteMany({});
  await DB.collection("environments").getCollection().deleteMany({});
  await DB.collection("deployments").getCollection().deleteMany({});
});

afterEach(async () => {
  await DB.collection("applications").getCollection().deleteMany({});
  await DB.collection("environments").getCollection().deleteMany({});
  await DB.collection("deployments").getCollection().deleteMany({});
});

describe("first method", () => {
  it("return document", async () => {
    interface IApplication extends IMongoloquentSchema {
      name: string;
      deployments?: Deployment[];
    }

    interface IEnveronment extends IMongoloquentSchema {
      name: string;
      applicationId: ObjectId;
    }

    interface Deployment extends IMongoloquentSchema {
      commit_hash: string;
      environmentId: ObjectId;
    }

    class Application extends Model<IApplication> {
      static $collection: string = "applications";
      static $schema: IApplication;

      deployments() {
        return this.hasManyThrough(
          Deployment,
          Environment,
          "applicationId",
          "environmentId",
          "_id",
          "_id",
        );
      }
    }

    class Environment extends Model<IEnveronment> {
      static $collection: string = "environments";
      static $schema: IEnveronment;
    }

    class Deployment extends Model<Deployment> {
      static $collection: string = "deployments";
      static $schema: Deployment;
    }

    const applicationIds = await Application.insertMany([
      { name: "app1" },
      { name: "app2" },
    ]);

    const environmentIds = await Environment.insertMany([
      { name: "env1", applicationId: applicationIds[0] },
      { name: "env2", applicationId: applicationIds[0] },
      { name: "env3", applicationId: applicationIds[1] },
    ]);

    await Deployment.insertMany([
      { commit_hash: "123", environmentId: environmentIds[0] },
      { commit_hash: "456", environmentId: environmentIds[1] },
      { commit_hash: "789", environmentId: environmentIds[2] },
    ]);

    const application = await Application.find(applicationIds[0]);
    const deployments = await application
      .deployments()
      .where("commit_hash", "123")
      .first();
    expect(deployments).toBeDefined();
    expect(deployments?.commit_hash).toBe("123");
  });

  it("return null", async () => {
    interface IApplication extends IMongoloquentSchema {
      name: string;
      deployments?: Deployment[];
    }

    interface IEnveronment extends IMongoloquentSchema {
      name: string;
      applicationId: ObjectId;
    }

    interface Deployment extends IMongoloquentSchema {
      commit_hash: string;
      environmentId: ObjectId;
    }

    class Application extends Model<IApplication> {
      static $collection: string = "applications";
      static $schema: IApplication;

      deployments() {
        return this.hasManyThrough(
          Deployment,
          Environment,
          "applicationId",
          "environmentId",
          "_id",
          "_id",
        );
      }
    }

    class Environment extends Model<IEnveronment> {
      static $collection: string = "environments";
      static $schema: IEnveronment;
    }

    class Deployment extends Model<Deployment> {
      static $collection: string = "deployments";
      static $schema: Deployment;
    }

    const applicationIds = await Application.insertMany([
      { name: "app1" },
      { name: "app2" },
    ]);

    const environmentIds = await Environment.insertMany([
      { name: "env1", applicationId: applicationIds[0] },
      { name: "env2", applicationId: applicationIds[0] },
      { name: "env3", applicationId: applicationIds[1] },
    ]);

    await Deployment.insertMany([
      { commit_hash: "123", environmentId: environmentIds[0] },
      { commit_hash: "456", environmentId: environmentIds[1] },
      { commit_hash: "789", environmentId: environmentIds[2] },
    ]);

    const application = await Application.find(applicationIds[0]);
    const deployments = await application
      .deployments()
      .where("commit_hash", "789")
      .first();
    expect(deployments).toBeNull();
  });
});

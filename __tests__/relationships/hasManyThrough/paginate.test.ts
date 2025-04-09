import exp from "constants";
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

describe("get method", () => {
  describe("without soft delete", () => {
    it("without parameter", async () => {
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
      const deployments = await application.deployments().paginate();
      expect(deployments).toEqual(expect.any(Object));
      expect(deployments).toHaveProperty("data");
      expect(deployments).toHaveProperty("meta");

      const data = deployments.data;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(2);

      const meta = deployments.meta;
      expect(meta).toEqual(expect.any(Object));
      expect(meta).toHaveProperty("total", 2);
      expect(meta).toHaveProperty("page", 1);
      expect(meta).toHaveProperty("limit", 15);
      expect(meta).toHaveProperty("lastPage", 1);
    });

    it("with parameter", async () => {
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
      const deployments = await application.deployments().paginate(2, 1);
      expect(deployments).toEqual(expect.any(Object));
      expect(deployments).toHaveProperty("data");
      expect(deployments).toHaveProperty("meta");

      const data = deployments.data;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);

      const meta = deployments.meta;
      expect(meta).toEqual(expect.any(Object));
      expect(meta).toHaveProperty("total", 2);
      expect(meta).toHaveProperty("page", 2);
      expect(meta).toHaveProperty("limit", 1);
      expect(meta).toHaveProperty("lastPage", 2);
    });
  });

  describe("with soft delete", () => {
    it("without parameter", async () => {
      interface IApplication
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete {
        name: string;
        deployments?: Deployment[];
      }

      interface IEnveronment
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete {
        name: string;
        applicationId: ObjectId;
      }

      interface Deployment
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete {
        commit_hash: string;
        environmentId: ObjectId;
      }

      class Application extends Model<IApplication> {
        static $collection: string = "applications";
        static $schema: IApplication;
        static $useSoftDelete: boolean = true;

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
        static $useSoftDelete: boolean = true;
      }

      class Deployment extends Model<Deployment> {
        static $collection: string = "deployments";
        static $schema: Deployment;
        static $useSoftDelete: boolean = true;
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

      const deploymentIds = await Deployment.insertMany([
        { commit_hash: "123", environmentId: environmentIds[0] },
        { commit_hash: "456", environmentId: environmentIds[1] },
        { commit_hash: "789", environmentId: environmentIds[2] },
        { commit_hash: "101", environmentId: environmentIds[0] },
      ]);

      await Deployment.destroy(deploymentIds[0]);

      const application = await Application.find(applicationIds[0]);
      let deployments = await application.deployments().paginate();
      expect(deployments).toEqual(expect.any(Object));
      expect(deployments).toHaveProperty("data");
      expect(deployments).toHaveProperty("meta");

      const data = deployments.data;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(2);

      const meta = deployments.meta;
      expect(meta).toEqual(expect.any(Object));
      expect(meta).toHaveProperty("total", 2);
      expect(meta).toHaveProperty("page", 1);
      expect(meta).toHaveProperty("limit", 15);
      expect(meta).toHaveProperty("lastPage", 1);

      deployments = await application.deployments().withTrashed().paginate();
      expect(deployments).toEqual(expect.any(Object));
      expect(deployments).toHaveProperty("data");
      expect(deployments).toHaveProperty("meta");
      const data2 = deployments.data;
      expect(data2).toEqual(expect.any(Array));
      expect(data2.length).toBe(3);
      const meta2 = deployments.meta;
      expect(meta2).toEqual(expect.any(Object));
      expect(meta2).toHaveProperty("total", 3);
      expect(meta2).toHaveProperty("page", 1);
      expect(meta2).toHaveProperty("limit", 15);
      expect(meta2).toHaveProperty("lastPage", 1);
    });

    it("with parameter", async () => {
      interface IApplication
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete {
        name: string;
        deployments?: Deployment[];
      }

      interface IEnveronment
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete {
        name: string;
        applicationId: ObjectId;
      }

      interface Deployment
        extends IMongoloquentSchema,
          IMongoloquentSoftDelete {
        commit_hash: string;
        environmentId: ObjectId;
      }

      class Application extends Model<IApplication> {
        static $collection: string = "applications";
        static $schema: IApplication;
        static $useSoftDelete: boolean = true;

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
        static $useSoftDelete: boolean = true;
      }

      class Deployment extends Model<Deployment> {
        static $collection: string = "deployments";
        static $schema: Deployment;
        static $useSoftDelete: boolean = true;
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

      const deploymentIds = await Deployment.insertMany([
        { commit_hash: "123", environmentId: environmentIds[0] },
        { commit_hash: "456", environmentId: environmentIds[1] },
        { commit_hash: "789", environmentId: environmentIds[2] },
        { commit_hash: "101", environmentId: environmentIds[0] },
      ]);

      await Deployment.destroy(deploymentIds[0]);

      const application = await Application.find(applicationIds[0]);
      const deployments = await application.deployments().paginate(2, 1);
      expect(deployments).toEqual(expect.any(Object));
      expect(deployments).toHaveProperty("data");
      expect(deployments).toHaveProperty("meta");

      const data = deployments.data;
      expect(data).toEqual(expect.any(Array));
      expect(data.length).toBe(1);

      const meta = deployments.meta;
      expect(meta).toEqual(expect.any(Object));
      expect(meta).toHaveProperty("total", 2);
      expect(meta).toHaveProperty("page", 2);
      expect(meta).toHaveProperty("limit", 1);
      expect(meta).toHaveProperty("lastPage", 2);

      const deployments2 = await application
        .deployments()
        .withTrashed()
        .paginate(2, 1);
      expect(deployments2).toEqual(expect.any(Object));
      expect(deployments2).toHaveProperty("data");
      expect(deployments2).toHaveProperty("meta");
      const data2 = deployments2.data;
      expect(data2).toEqual(expect.any(Array));
      expect(data2.length).toBe(1);
      const meta2 = deployments2.meta;
      expect(meta2).toEqual(expect.any(Object));
      expect(meta2).toHaveProperty("total", 3);
      expect(meta2).toHaveProperty("page", 2);
      expect(meta2).toHaveProperty("limit", 1);
      expect(meta2).toHaveProperty("lastPage", 3);
    });
  });
});

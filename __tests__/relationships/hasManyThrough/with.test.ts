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

describe("with method", () => {
  describe("without soft delete", () => {
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
      protected $collection: string = "applications";
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
      protected $collection: string = "environments";
      static $schema: IEnveronment;
    }

    class Deployment extends Model<Deployment> {
      protected $collection: string = "deployments";
      static $schema: Deployment;
    }

    it("without param", async () => {
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

      const application = await Application.with("deployments")
        .where("_id", applicationIds[0])
        .first();

      expect(application).toBeDefined();
      expect(application?.deployments).toBeDefined();
      expect(application?.deployments?.length).toBe(2);
      expect(application?.deployments?.[0]).toEqual(expect.any(Object));
      expect(application?.deployments?.[0]).toHaveProperty(
        "commit_hash",
        "123",
      );
      expect(application?.deployments?.[0]).toHaveProperty("environmentId");
    });

    it("with select param", async () => {
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

      const application = await Application.with("deployments", {
        select: ["commit_hash"],
      })
        .where("_id", applicationIds[0])
        .first();

      expect(application).toBeDefined();
      expect(application?.deployments).toBeDefined();
      expect(application?.deployments?.length).toBe(2);
      expect(application?.deployments?.[0]).toEqual(expect.any(Object));
      expect(application?.deployments?.[0]).toHaveProperty(
        "commit_hash",
        "123",
      );
      expect(application?.deployments?.[0]).not.toHaveProperty("environmentId");
    });

    it("with exclude param", async () => {
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

      const application = await Application.with("deployments", {
        exclude: ["commit_hash"],
      })
        .where("_id", applicationIds[0])
        .first();

      expect(application).toBeDefined();
      expect(application?.deployments).toBeDefined();
      expect(application?.deployments?.length).toBe(2);
      expect(application?.deployments?.[0]).toEqual(expect.any(Object));
      expect(application?.deployments?.[0]).not.toHaveProperty(
        "commit_hash",
        "123",
      );
      expect(application?.deployments?.[0]).toHaveProperty("environmentId");
    });
  });

  describe("with soft delete", () => {
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

    interface Deployment extends IMongoloquentSchema, IMongoloquentSoftDelete {
      commit_hash: string;
      environmentId: ObjectId;
    }

    class Application extends Model<IApplication> {
      protected $collection: string = "applications";
      protected $useSoftDelete: boolean = true;
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
      protected $collection: string = "environments";
      protected $useSoftDelete: boolean = true;
      static $schema: IEnveronment;
    }

    class Deployment extends Model<Deployment> {
      protected $collection: string = "deployments";
      protected $useSoftDelete: boolean = true;
      static $schema: Deployment;
    }

    it("without param", async () => {
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
      ]);

      await Deployment.destroy(deploymentIds[0]);

      const application = await Application.with("deployments")
        .where("_id", applicationIds[0])
        .first();

      expect(application).toBeDefined();
      expect(application?.deployments).toBeDefined();
      expect(application?.deployments?.length).toBe(1);
      expect(application?.deployments?.[0]).toEqual(expect.any(Object));
      expect(application?.deployments?.[0]).toHaveProperty(
        "commit_hash",
        "456",
      );
      expect(application?.deployments?.[0]).toHaveProperty("environmentId");

      const deployments = await Deployment.withTrashed().get();
      expect(deployments).toHaveLength(3);
    });

    it("with select param", async () => {
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
      ]);

      await Deployment.destroy(deploymentIds[0]);

      const application = await Application.with("deployments", {
        select: ["commit_hash"],
      })
        .where("_id", applicationIds[0])
        .first();

      expect(application).toBeDefined();
      expect(application?.deployments).toBeDefined();
      expect(application?.deployments?.length).toBe(1);
      expect(application?.deployments?.[0]).toEqual(expect.any(Object));
      expect(application?.deployments?.[0]).toHaveProperty(
        "commit_hash",
        "456",
      );
      expect(application?.deployments?.[0]).not.toHaveProperty("environmentId");

      const deployments = await Deployment.withTrashed().get();
      expect(deployments).toHaveLength(3);
    });

    it("with exclude param", async () => {
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
      ]);

      await Deployment.destroy(deploymentIds[0]);

      const application = await Application.with("deployments", {
        exclude: ["commit_hash"],
      })
        .where("_id", applicationIds[0])
        .first();

      expect(application).toBeDefined();
      expect(application?.deployments).toBeDefined();
      expect(application?.deployments?.length).toBe(1);
      expect(application?.deployments?.[0]).toEqual(expect.any(Object));
      expect(application?.deployments?.[0]).not.toHaveProperty("commit_hash");
      expect(application?.deployments?.[0]).toHaveProperty("environmentId");

      const deployments = await Deployment.withTrashed().get();
      expect(deployments).toHaveLength(3);
    });
  });
});

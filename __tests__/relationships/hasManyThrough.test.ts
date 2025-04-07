import { ObjectId } from "mongodb";

import Model from "../../src/Model";
import { IMongoloquentSchema } from "../../src/interfaces/ISchema";

interface IProject extends IMongoloquentSchema {
  _id: ObjectId;
  name: string;
}

interface IEnvironment extends IMongoloquentSchema {
  _id: ObjectId;
  name: string;
  projectId: ObjectId;
}

interface IDeployment extends IMongoloquentSchema {
  _id: ObjectId;
  commitHash: string;
  environmentId: ObjectId;
}

class Project extends Model<IProject> {
  static $collection = "projects";
  static $useTimestamps = true;
  static $useSoftDelete = true;

  deployments() {
    return this.hasManyThrough(
      Deployment,
      Environment,
      "projectId",
      "environmentId",
    );
  }
}

class Environment extends Model<IEnvironment> {
  static $collection = "environments";
  static $useTimestamps = true;
  static $useSoftDelete = true;
}

class Deployment extends Model<IDeployment> {
  static $collection = "deployments";
  static $useTimestamps = true;
  static $useSoftDelete = true;
}

let projectIds: ObjectId[];
let environmentIds: ObjectId[];
let deploymentIds: ObjectId[];

beforeAll(async () => {
  projectIds = await Project.insertMany([
    { name: "Project 1", language: "Javascript" },
    { name: "Project 2", language: "Python" },
    { name: "Project 3", language: "Java" },
  ]);

  environmentIds = await Environment.insertMany([
    { name: "Node", projectId: projectIds[0] },
    { name: "Bun", projectId: projectIds[0] },
    { name: "Flask", projectId: projectIds[1] },
  ]);

  deploymentIds = await Deployment.insertMany([
    {
      commitHash: "001",
      environmentId: environmentIds[0],
    },
    {
      commitHash: "002",
      environmentId: environmentIds[0],
    },
    {
      commitHash: "003",
      environmentId: environmentIds[0],
    },
    {
      commitHash: "011",
      environmentId: environmentIds[1],
    },
    {
      commitHash: "012",
      environmentId: environmentIds[1],
    },
    {
      commitHash: "121",
      environmentId: environmentIds[2],
    },
  ]);
});

afterAll(async () => {
  await Project["query"]().forceDestroy();
  await Environment["query"]().forceDestroy();
  await Deployment["query"]().forceDestroy();
});

describe("hasManyThrough relation", () => {
  it("Should return related data", async () => {
    const project = await Project.with("deployments")
      .where("_id", projectIds[0])
      .first();

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    expect(project?.deployments).toEqual(expect.any(Array));
    expect(project?.deployments).toHaveLength(5);
  });

  it("With selected fields", async () => {
    const project = await Project.with("deployments", {
      select: ["commitHash"],
    })
      .where("_id", projectIds[0])
      .first();

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    expect(project?.deployments).toEqual(expect.any(Array));
    expect(project?.deployments).toHaveLength(5);

    expect(project?.deployments[0]).toEqual(expect.any(Object));
    expect(project?.deployments[0]).toHaveProperty("commitHash");
    expect(project?.deployments[0]).not.toHaveProperty("_id");
    expect(project?.deployments[0]).not.toHaveProperty("environmentId");
  });

  it("With excluded fields", async () => {
    const project = await Project.with("deployments", {
      exclude: ["commitHash"],
    })
      .where("_id", projectIds[0])
      .first();

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    expect(project?.deployments).toEqual(expect.any(Array));
    expect(project?.deployments).toHaveLength(5);

    const deployment = project?.deployments[0];
    expect(deployment).toEqual(expect.any(Object));
    expect(deployment).not.toHaveProperty("commitHash");
    expect(deployment).toHaveProperty("_id");
    expect(deployment).toHaveProperty("environmentId");
  });

  it("With has no related data", async () => {
    const project = await Project.with("deployments")
      .where("_id", projectIds[2])
      .first();

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    expect(project?.deployments).toEqual(expect.any(Array));
    expect(project?.deployments).toHaveLength(0);
  });

  it("With Querying related data", async () => {
    const project = await Project.find(projectIds[0]);

    const deployments = await project
      .deployments()
      .where("commitHash", "001")
      .get();

    expect(deployments).toEqual(expect.any(Array));
    expect(deployments).toHaveLength(1);
  });

  it("With softDelete target data", async () => {
    await Deployment.destroy(deploymentIds[0]);

    const project = await Project.with("deployments")
      .where("_id", projectIds[0])
      .first();

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    expect(project?.deployments).toEqual(expect.any(Array));
    expect(project?.deployments).toHaveLength(4);

    const d = await Project.find(projectIds[0]);
    const deploymentsWithTrashed = await d.deployments().withTrashed().get();

    expect(deploymentsWithTrashed).toEqual(expect.any(Array));
    expect(deploymentsWithTrashed).toHaveLength(5);
  });
});

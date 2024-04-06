import { ObjectId } from "mongodb";
import Model from "../../src/database/Model";

class Project extends Model {
  static collection = "projects";
  static timestamps = true;
  static softDelete = true;

  static deployments() {
    return this.hasManyThrough(
      Deployment,
      Environment,
      "projectId",
      "environmentId"
    );
  }
}

class Environment extends Model {
  static collection = "environments";
  static timestamps = true;
  static softDelete = true;
}

class Deployment extends Model {
  static collection = "deployments";
  static timestamps = true;
  static softDelete = true;
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
  const projectCollection = Project["getCollection"]();
  const environmentCollection = Environment["getCollection"]();
  const deploymentCollection = Deployment["getCollection"]();

  await projectCollection.deleteMany({});
  await environmentCollection.deleteMany({});
  await deploymentCollection.deleteMany({});
});

describe("hasManyThrough relation", () => {
  it("Should return related data", async () => {
    const { data: project }: any = await Project.with("deployments").find(
      projectIds[0]
    );

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    const { deployments } = project;
    expect(deployments).toEqual(expect.any(Array));
    expect(deployments).toHaveLength(5);
  });

  it("With selected fields", async () => {
    const { data: project }: any = await Project.with("deployments", {
      select: ["commitHash"],
    }).find(projectIds[0]);

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    const { deployments } = project;
    expect(deployments).toEqual(expect.any(Array));
    expect(deployments).toHaveLength(5);

    const [deployment] = deployments;
    expect(deployment).toEqual(expect.any(Object));
    expect(deployment).toHaveProperty("commitHash");
    expect(deployment).not.toHaveProperty("_id");
    expect(deployment).not.toHaveProperty("environmentId");
  });

  it("With excluded fields", async () => {
    const { data: project }: any = await Project.with("deployments", {
      exclude: ["commitHash"],
    }).find(projectIds[0]);

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    const { deployments } = project;
    expect(deployments).toEqual(expect.any(Array));
    expect(deployments).toHaveLength(5);

    const [deployment] = deployments;
    expect(deployment).toEqual(expect.any(Object));
    expect(deployment).not.toHaveProperty("commitHash");
    expect(deployment).toHaveProperty("_id");
    expect(deployment).toHaveProperty("environmentId");
  });

  it("With has no related data", async () => {
    const { data: project }: any = await Project.with("deployments").find(
      projectIds[2]
    );

    expect(project).toEqual(expect.any(Object));
    expect(project).toHaveProperty("deployments");

    const { deployments } = project;
    expect(deployments).toEqual(expect.any(Array));
    expect(deployments).toHaveLength(0);
  });

  it("With Querying related data", async () => {
    const project: any = await Project.find(projectIds[0]);

    const deployments = await project
      .deployments()
      .where("commitHash", "001")
      .get();

    expect(deployments).toEqual(expect.any(Array));
    expect(deployments).toHaveLength(1);
  });

  it("With softDelete target data", async () => {
    await Deployment.destroy(deploymentIds[0]);

    const project: any = await Project.with("deployments").find(projectIds[0]);

    expect(project.data).toEqual(expect.any(Object));
    expect(project.data).toHaveProperty("deployments");

    const { deployments } = project.data;
    expect(deployments).toEqual(expect.any(Array));
    expect(deployments).toHaveLength(4);

    const deploymentsWithTrashed = await project
      .deployments()
      .withTrashed()
      .get();

    expect(deploymentsWithTrashed).toEqual(expect.any(Array));
    expect(deploymentsWithTrashed).toHaveLength(5);
  });
});

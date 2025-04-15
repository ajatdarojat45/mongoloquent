import { collect } from "../../src";

describe("multiply", () => {
  it("with numbers", () => {
    const multiply = collect([1, 2]).multiply(3);

    expect(multiply).toEqual([1, 2, 1, 2, 1, 2]);
  });

  it("with objects", () => {
    const multiply = collect([
      { name: "User #1", email: "user1@example.com" },
      { name: "User #2", email: "user2@example.com" },
    ]).multiply(3);

    expect(multiply).toEqual([
      { name: "User #1", email: "user1@example.com" },
      { name: "User #2", email: "user2@example.com" },
      { name: "User #1", email: "user1@example.com" },
      { name: "User #2", email: "user2@example.com" },
      { name: "User #1", email: "user1@example.com" },
      { name: "User #2", email: "user2@example.com" },
    ]);
  });
});

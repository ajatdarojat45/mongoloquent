import checkTimestaps from "../../src/helpers/checkTimestaps";

test("checkTimestaps function result should be return an object with createdAt and updatedAt properties", () => {
  const payload = {
    name: "test",
  };

  const result = checkTimestaps(true, payload);

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("name");
  expect(result).toHaveProperty("createdAt");
  expect(result).toHaveProperty("updatedAt");
});

test("checkTimestaps function result should be return an object without createdAt and updatedAt properties", () => {
  const payload = {
    name: "test",
  };

  const result = checkTimestaps(false, payload);

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("name");
  expect(result).not.toHaveProperty("createdAt");
  expect(result).not.toHaveProperty("updatedAt");
});

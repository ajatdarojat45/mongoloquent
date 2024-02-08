import checkSoftDelete from "../../src/helpers/checkSoftDelete";

test("checkSoftDelete function result should be return an object with property isDeleted", () => {
  const payload = {
    name: "Test",
  };

  const result = checkSoftDelete(true, payload);

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("name");
  expect(result).toHaveProperty("isDeleted");
});

test("checkSoftDelete function result should be return an object without property isDeleted", () => {
  const payload = {
    name: "test",
  };

  const result = checkSoftDelete(false, payload);

  expect(result).toEqual(expect.any(Object));
  expect(result).toHaveProperty("name");
  expect(result).not.toHaveProperty("isDeleted");
});

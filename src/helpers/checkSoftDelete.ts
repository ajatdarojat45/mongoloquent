function checkSoftDelete(softDelete: boolean, payload: object): object {
  if (softDelete) {
    return { ...payload, isDeleted: false };
  }

  return payload;
}

export default checkSoftDelete;

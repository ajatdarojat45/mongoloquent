function checkSoftDelete(softDelete, payload) {
  if (softDelete) {
    return { ...payload, isDeleted: false };
  }
}

module.exports = checkSoftDelete;

export default class Collection<T> extends Array<T> {
  constructor(args: T[]) {
    super(...args);
  }
}

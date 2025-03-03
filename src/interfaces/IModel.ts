export interface IModelPaginate {
  data: object[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

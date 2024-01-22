export interface PaginateInterface {
  data: object[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}

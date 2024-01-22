export interface QueriesInterface {
  $match?: {
    $and?: object[];
    $or?: object[];
  };
}

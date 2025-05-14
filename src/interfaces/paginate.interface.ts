export interface IPaginateResult<T> {
  totalPage: number;
  currentPage: number;
  data: T[];
}

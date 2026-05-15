export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};


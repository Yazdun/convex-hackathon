type TValidResponse<T> = {
  data: T;
  error: null;
};

type CustomError = {
  message: string;
};

type TErrorResponse = {
  data: null;
  error: CustomError;
};

type TResponseOverload<t> = TValidResponse<t> | TErrorResponse;

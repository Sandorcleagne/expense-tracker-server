export const response = (
  status: boolean,
  message: string,
  result: any,
) => {
  return {
    status: status || true,
    message: message,
    result: result,
  };
};

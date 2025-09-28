export const response = (message: string, result: any) => {
  return {
    status: true,
    message: message,
    result: result,
  };
};

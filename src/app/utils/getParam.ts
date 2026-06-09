export const getParam = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value;

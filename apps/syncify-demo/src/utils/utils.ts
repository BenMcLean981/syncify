export function throwResponseError(response: Response): never {
  throw new Error(
    `Request failed: ${response.status} - ${response.statusText}`
  );
}

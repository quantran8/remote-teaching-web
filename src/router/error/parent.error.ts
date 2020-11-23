export class RequireParentError extends Error {
  constructor() {
    super("User is not a parent");
  }
}

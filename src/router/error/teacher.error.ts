export class RequireTeacherError extends Error {
  constructor() {
    super("User is not a teacher");
  }
}

export enum GLErrorCode {
  CLASS_IS_NOT_ACTIVE = 111,
}
export interface GLError {
  errorCode: GLErrorCode;
  message?: string;
  payload?: any;
}

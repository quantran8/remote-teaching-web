export enum GLErrorCode {
  CLASS_IS_NOT_ACTIVE = 111,
  CLASS_HAS_BEEN_ENDED = 112,
}
export interface GLError {
  errorCode: GLErrorCode;
  message?: string;
  payload?: any;
}

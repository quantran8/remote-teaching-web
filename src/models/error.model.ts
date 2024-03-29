export enum GLErrorCode {
  DISCONNECT = 500,
  SUCCESS = 200,
  CLASS_IS_NOT_ACTIVE = 111,
  CLASS_HAS_BEEN_ENDED = 112,
  PARENT_NOT_HAVE_THIS_STUDENT = 113,
}
export interface GLError {
  errorCode: GLErrorCode;
  message?: string;
  payload?: any;
}

export interface GLApiStatus {
  code: GLErrorCode;
  message?: string;
  payload?: any;
}

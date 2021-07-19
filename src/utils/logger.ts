export class Logger {
  private static _ENABLE_ = true;
  public static log(message?: any, ...optionalParams: any[]) {
    if (!this._ENABLE_) return;
    console.log(message ? message : "", ...optionalParams);
  }
  public static info(message?: any, ...optionalParams: any[]) {
    if (!this._ENABLE_) return;
    console.info(message ? message : "", ...optionalParams);
  }
  public static error(message?: any, ...optionalParams: any[]) {
    if (!this._ENABLE_) return;
    console.error(message ? message : "", ...optionalParams);
  }
  public static debug(message?: any, ...optionalParams: any[]) {
    if (!this._ENABLE_) return;
    console.debug(message ? message : "", ...optionalParams);
  }
}

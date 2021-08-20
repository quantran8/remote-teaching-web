export class Logger {
  private static _DISABLE_ = process.env.VUE_APP_ENVIRONMENT === "prod";
  public static log(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    Logger.log(message ? message : "", ...optionalParams);
  }
  public static info(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    Logger.info(message ? message : "", ...optionalParams);
  }
  public static error(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    Logger.error(message ? message : "", ...optionalParams);
  }
  public static debug(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    Logger.debug(message ? message : "", ...optionalParams);
  }
}

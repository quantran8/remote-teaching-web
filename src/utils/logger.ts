export class Logger {
  private static _DISABLE_ =
    (!localStorage.getItem("prod_log_enable") || localStorage.getItem("prod_log_enable") === "false") && process.env.VUE_APP_ENVIRONMENT === "prod";
  public static log(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    console.log(message ? message : "", ...optionalParams);
  }
  public static info(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    console.info(message ? message : "", ...optionalParams);
  }
  public static error(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    console.error(message ? message : "", ...optionalParams);
  }
  public static debug(message?: any, ...optionalParams: any[]) {
    if (this._DISABLE_) return;
    console.debug(message ? message : "", ...optionalParams);
  }
}

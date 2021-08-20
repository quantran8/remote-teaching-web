export class Logger {
  private static disable = () => {
    if (process.env.VUE_APP_ENVIRONMENT === "prod") {
      let status = true;
      if (localStorage.getItem("prod_log_enable") === "true") {
        status = false;
      }
      return status;
    }
    return false;
  };
  public static log(message?: any, ...optionalParams: any[]) {
    if (this.disable()) return;
    console.log(message ? message : "", ...optionalParams);
  }
  public static info(message?: any, ...optionalParams: any[]) {
    if (this.disable()) return;
    console.info(message ? message : "", ...optionalParams);
  }
  public static error(message?: any, ...optionalParams: any[]) {
    if (this.disable()) return;
    console.error(message ? message : "", ...optionalParams);
  }
  public static debug(message?: any, ...optionalParams: any[]) {
    if (this.disable()) return;
    console.debug(message ? message : "", ...optionalParams);
  }
}

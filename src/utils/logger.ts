export class Logger {
  public static log(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
  }
  public static info(message?: any, ...optionalParams: any[]) {
    console.info(message, ...optionalParams);
  }
  public static error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }
  public static debug(message?: any, ...optionalParams: any[]) {
    console.debug(message, ...optionalParams);
  }
}

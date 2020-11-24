export const ENABLE_LOG = true;
export const AGORA_CUSTOMER_ID = "f0ca1e5533fc4f22b39a8fd970634f39";
export const AGORA_CUSTOMER_CERTIFICATE = "9298bee82ea34a21ae5b7fba73719fb9";
export const AGORA_RESTFULL_TOKEN = "agora_restful_api_token";
export const AGORA_APP_SDK_DOMAIN = "https://api.agora.io";
export const AGORA_APP_ID = "da2d4c42cea04e30973bd4d6800dd468";
export const AGORA_APP_TOKEN =
  "006da2d4c42cea04e30973bd4d6800dd468IAA9MiiC0LEonRHtDnq0Trz2S5BwMJPE97eiV9wm8VYa8v4QIssAAAAAEABID2Uqrfi9XwEAAQCs+L1f";
export const AGORA_APP_CERTIFICATE = "7fc4785b0a4b44c7a7b095aea71bbc2d";
export const AGORA_APP_SDK_LOG_SECRET = "agora_edu_sdk_log_secret";
export const NETLESS_APP_ID = "XvsYcCsPEeu0Xy2cBkFEzw/IFE3jXGbuV-E0Q";
const genToken = (): string => {
  return window.btoa(
    `${process.env.AGORA_CUSTOMER_ID}:${process.env.AGORA_CUSTOMER_CERTIFICATE}`
  );
};
export const AGORA_AUTHORIZATION: string = genToken();

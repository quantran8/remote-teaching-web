/* eslint-disable @typescript-eslint/camelcase */
import { KJUR } from "jsrsasign";

export function generateVideoToken(sdkKey: string, sdkSecret: string, sessionName: string) {
  let signature = "";
  try {
    const oHeader = { alg: "HS256", typ: "JWT" };
    const oPayload = {
      app_key: sdkKey,
      version: 1,
      iat: new Date().getTime(),
      exp: new Date(Date.now() + 23 * 3600 * 1000).getTime(),
      tpc: sessionName,
    };
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);
  } catch (e) {
    console.error(e);
  }
  return signature;
}

/* eslint-disable @typescript-eslint/camelcase */
import moment from "moment";

import { KJUR } from "jsrsasign";
import { SDK_KEY, SDK_SECRET } from "./config";

export function isSupportWebCodecs() {
  return typeof (window as any).MediaStreamTrackProcessor === "function";
}

export function generateVideoToken(sessionName: string, role: number) {
  let signature = "";
  try {
    const oHeader = { alg: "HS256", typ: "JWT" };
    const oPayload = {
      app_key: SDK_KEY,
      version: 1,
      role_type: role,
      iat: moment().unix(),
      exp: moment()
        .add(12, "hours")
        .unix(),
      tpc: sessionName,
    };
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, SDK_SECRET);
  } catch (e) {
    console.error(e);
  }
  return signature;
}

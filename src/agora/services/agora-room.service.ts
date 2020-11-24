import {
  AGORA_APP_ID,
  AGORA_APP_SDK_DOMAIN,
  AGORA_AUTHORIZATION,
} from "../agora.config";
import { AgoraHttpClient } from "./agora-httpclient";

export class AgoraRoomApi {
  constructor() {}

  get prefix(): string {
    return `${AGORA_APP_SDK_DOMAIN}/scene/apps/%app_id`.replace(
      "%app_id",
      AGORA_APP_ID
    );
  }

  async fetch(params: any) {
    const { method, token, data, full_url, url, type } = params;
    const opts: any = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${AGORA_AUTHORIZATION!.replace(
          /basic\s+|basic/i,
          ""
        )}`,
      },
    };

    if (data) {
      opts.body = JSON.stringify(data);
    }

    if (token) {
      opts.headers["token"] = token;
    }

    let resp: any;
    if (full_url) {
      resp = await AgoraHttpClient(`${full_url}`, opts);
    } else {
      resp = await AgoraHttpClient(`${this.prefix}${url}`, opts);
    }

    if (resp.code !== 0) {
      throw { msg: resp.msg };
    }

    return resp;
  }

  async acquireRoomGroupBy(roomUuid: string, userToken: string) {
    const memberLimit = 4;
    try {
      let data = await this.createGroup(roomUuid, memberLimit, userToken);
      return data;
    } catch (err) {
      console.warn("[breakout] ", err);
    }
  }

  async fetchRoom(params: { roomName: string }) {
    const roomConfig: any = {
      roomUuid: `${params.roomName}`,
      roomName: `${params.roomName}`,
      roleConfig: {
        host: {
          limit: 1,
        },
        audience: {
          limit: 16,
        },
      },
    };
    try {
      await this.createRoom(roomConfig);
    } catch (err) {
      if (err.msg !== "Room conflict!") {
        throw err;
      }
    }
    return await this.queryRoom(roomConfig.roomUuid);
  }

  async createGroup(roomUuid: string, memberLimit: number, userToken: string) {
    let res = await this.fetch({
      full_url: `${AGORA_APP_SDK_DOMAIN}/grouping/apps/${AGORA_APP_ID}/v1/rooms/${roomUuid}/groups`,
      method: "POST",
      data: {
        roleConfig: {
          audience: {
            limit: 4,
          },
          assistant: {
            limit: 1,
          },
        },
        memberLimit: memberLimit,
      },
      token: userToken,
    });
    return res.data;
  }

  async createRoom(params: any) {
    const { roomUuid, ...data } = params;
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/config`,
      method: "POST",
      data: data,
    });
    return res;
  }

  async queryRoom(roomUuid: string): Promise<any> {
    let { data } = await this.fetch({
      url: `/v1/rooms/${roomUuid}/config`,
      method: "GET",
    });
    return {
      roomName: data.roomName,
      roomUuid: data.roomUuid,
      roleConfig: data.roleConfig,
    };
  }

  async queryScreenShare(roomUuid: string): Promise<any> {
    let { data } = await this.fetch({
      url: `/v1/rooms/${roomUuid}/config`,
      method: "POST",
    });
    return {
      uid: data.uid,
      channel: data.channel,
      token: data.token,
    };
  }

  async login(username: string, isHost: boolean = false) {
    let response = await this.fetch({
      url: `/v1/users/${username}/login`,
      method: "POST",
    });
    return response;
  }

  async entry(
    room: string,
    username: string,
    token: string,
    streamUUID: string = "0",
    role: "host" | "audience" = "audience"
  ) {
    const url = `/v1/rooms/${room}/users/${username}/entry`;
    return await this.fetch({
      url: url,
      method: "POST",
      data: {
        userName: username,
        streamUuid: streamUUID,
        role: role,
      },
      token: token,
    });
  }
}

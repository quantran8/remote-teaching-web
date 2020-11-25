import { AgoraClient, AgoraClientOptions } from "@/agora";

export interface RoomOptions {
  agora: AgoraClientOptions;
}

export class RoomManager {
  _agoraClient?: AgoraClient;
  _options?: RoomOptions;

  constructor(options?: RoomOptions) {
    if (options) this.init(options);
  }

  get agoraClient(): AgoraClient {
    return this._agoraClient as AgoraClient;
  }

  get options(): RoomOptions {
    return this._options as RoomOptions;
  }

  init(options: RoomOptions) {
    if (this._options) return;
    this.reset();
    this._options = options;
    this._agoraClient = new AgoraClient(options.agora);
  }

  join() {
    this.agoraClient.initClient();
  }

  reset() {
    console.log("reset room");
  }
}

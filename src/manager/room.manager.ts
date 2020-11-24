import { AgoraClient, AgoraClientOptions } from "@/agora";
import { AGORA_APP_ID, AGORA_APP_TOKEN } from "@/agora/agora.config";
import { MediaService } from "@/agora/media-service";

export interface RoomOptions {
  agora: AgoraClientOptions;
}

export class RoomManager {
  _agoraClient?: AgoraClient;
  _options?: RoomOptions;
  _mediaService?: MediaService;

  constructor(options?: RoomOptions) {
    if (options) this.init(options);
  }

  get agoraClient(): AgoraClient {
    return this._agoraClient as AgoraClient;
  }
  get mediaService(): MediaService {
    return this._mediaService as MediaService;
  }
  get options(): RoomOptions {
    return this._options as RoomOptions;
  }

  init(options: RoomOptions) {
    if (this._options) return;
    this.reset();
    this._options = options;
    this._agoraClient = new AgoraClient(options.agora);
    this._mediaService = new MediaService(options.agora);
  }

  join() {
    this.mediaService.init();
  }

  reset() {
    console.log("reset room manager");
  }
}

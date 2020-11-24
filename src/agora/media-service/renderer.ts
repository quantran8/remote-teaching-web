import { ILocalVideoTrack, ITrack } from "agora-rtc-sdk-ng";
import { MediaService } from ".";
import { randomUUID } from "@/utils/utils";

type SourceType = "default" | "screen";

export interface IMediaRenderer {
  context: MediaService;
  _playing: boolean;
  local: boolean;
  sourceType: SourceType;
  uid: any;
  videoTrack?: ITrack;

  play(dom: HTMLElement, fit?: boolean): void;
  stop(isPreview?: boolean): void;
}

export interface UserRendererInit {
  context: MediaService;
  uid: any;
  videoTrack?: ITrack;
  sourceType: SourceType;
}

export abstract class UserRenderer implements IMediaRenderer {
  context: MediaService;
  _playing: boolean = false;
  local: boolean = false;
  sourceType: SourceType = "screen";
  uid: any = 0;
  videoTrack?: ITrack;
  uuid: string;

  constructor(config: UserRendererInit) {
    this.context = config.context;
    this.uid = config.uid;
    if (config.videoTrack) {
      this.videoTrack = config.videoTrack;
    }
    this.uuid = randomUUID();
    this.sourceType = config.sourceType;
  }

  play(dom: HTMLElement, fit?: boolean): void {
    throw new Error("Method not implemented.");
  }
  stop(): void {
    throw new Error("Method not implemented.");
  }
}

export class LocalUserRenderer extends UserRenderer {
  constructor(config: UserRendererInit) {
    super(config);
    this.local = true;
  }

  play(dom: HTMLElement, fit?: boolean): void {
    if (this.videoTrack) {
      this.videoTrack.play(dom);
    }
    this._playing = true;
  }

  stop(isPreview?: boolean) {
    if (this.videoTrack) {
      this.videoTrack.stop();
    }
    this.videoTrack as ILocalVideoTrack;

    this._playing = false;
  }

  getUuid() {
    return this.uuid;
  }
}

export class RemoteUserRenderer extends UserRenderer {
  constructor(config: UserRendererInit) {
    super(config);
    this.local = false;
    this.uid = config.uid;
  }

  play(dom: HTMLElement, fit?: boolean) {
    if (this.videoTrack) {
      this.videoTrack.play(dom);
    }

    this._playing = true;
  }

  stop() {
    if (this.videoTrack) {
      this.videoTrack.stop();
    }

    this._playing = false;
  }

  getUuid() {
    return this.uuid;
  }
}

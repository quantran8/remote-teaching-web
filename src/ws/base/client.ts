import { GLGlobal } from "@/commonui";
import { Logger } from "@/utils/logger";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  HubConnection,
  HubConnectionState,
} from "@microsoft/signalr";

import { RoomWSEvent, StudentWSEvent, TeacherWSEvent } from "..";
import { WSEvent, WSEventHandler } from "./event";

export interface GLSocketOptions {
  url: string;
}
export class GLSocketClient {
  private _hubConnection?: HubConnection;
  private _options?: GLSocketOptions;
  private _isConnected = false;
  constructor(options: GLSocketOptions) {
    this._options = options;
  }
  get hubConnection(): HubConnection {
    return this._hubConnection as HubConnection;
  }
  get options(): GLSocketOptions {
    return this._options as GLSocketOptions;
  }
  async init() {
    const options = {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      logging: LogLevel.Trace,
      accessTokenFactory: () => GLGlobal.loginInfo().access_token,
    };
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(this.options.url, options)
      .configureLogging(LogLevel.Debug)
      .build();
    this._isConnected = false;
  }
  get isConnected(): boolean {
    return this._isConnected;
  }
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    return this._hubConnection?.stop();
  }
  async connect(): Promise<any> {
    if (this.isConnected) return Promise.resolve();
    if (!this._hubConnection) await this.init();
    return new Promise((resolve, reject) => {
      this.hubConnection
        .start()
        .then((res) => {
          this._isConnected = true;
          resolve(res);
        })
        .catch((err) => {
          this._isConnected = false;
          Logger.error("GLSOCKET", err);
          reject(err);
        });
    });
  }
  async send(command: string, payload: any): Promise<any> {
    Logger.log("SEND", command, payload);
    if (
      !this.isConnected ||
      this.hubConnection.state === HubConnectionState.Disconnected
    ) {
      this._isConnected = false;
      await this.connect();
    }
    return this.hubConnection.send(command, payload);
  }

  registerEventHandler(handler: WSEventHandler) {
    const handlers: Map<WSEvent, Function> = new Map<WSEvent, Function>();
    handlers.set(RoomWSEvent.EVENT_ROOM_INFO, handler.onRoomInfo);
    handlers.set(StudentWSEvent.JOIN_CLASS, handler.onStudentJoinClass);
    handlers.set(StudentWSEvent.STREAM_CONNECT, handler.onStudentStreamConnect);
    handlers.set(StudentWSEvent.MUTE_AUDIO, handler.onStudentMuteAudio);
    handlers.set(StudentWSEvent.MUTE_VIDEO, handler.onStudentMuteVideo);
    handlers.set(StudentWSEvent.LEAVE, handler.onStudentLeave);
    handlers.set(StudentWSEvent.DISCONNECT, handler.onStudentDisconnected);

    handlers.set(
      StudentWSEvent.STUDENT_RAISING_HAND,
      handler.onStudentRaisingHand
    );
    handlers.set(StudentWSEvent.STUDENT_LIKE, handler.onStudentLike);

    handlers.set(TeacherWSEvent.JOIN_CLASS, handler.onTeacherJoinClass);
    handlers.set(TeacherWSEvent.STREAM_CONNECT, handler.onTeacherStreamConnect);
    handlers.set(TeacherWSEvent.MUTE_AUDIO, handler.onTeacherMuteAudio);
    handlers.set(TeacherWSEvent.MUTE_VIDEO, handler.onTeacherMuteVideo);
    handlers.set(
      TeacherWSEvent.MUTE_STUDENT_VIDEO,
      handler.onTeacherMuteStudentVideo
    );
    handlers.set(
      TeacherWSEvent.MUTE_STUDENT_AUDIO,
      handler.onTeacherMuteStudentAudio
    );
    handlers.set(
      TeacherWSEvent.MUTE_VIDEO_ALL_STUDENT,
      handler.onTeacherMuteAllStudentVideo
    );
    handlers.set(
      TeacherWSEvent.MUTE_AUDIO_ALL_STUDENT,
      handler.onTeacherMuteAllStudentAudio
    );
    handlers.set(TeacherWSEvent.END_CLASS, handler.onTeacherEndClass);
    handlers.set(TeacherWSEvent.DISCONNECT, handler.onTeacherDisconnect);
    handlers.set(TeacherWSEvent.SET_FOCUS_TAB, handler.onTeacherSetFocusTab);
    handlers.set(
      TeacherWSEvent.UPDATE_GLOBAL_AUDIO,
      handler.onTeacherUpdateGlobalAudio
    );
    handlers.set(
      TeacherWSEvent.UPDATE_LOCAL_AUDIO,
      handler.onTeacherUpdateLocalAudio
    );
    handlers.set(
      TeacherWSEvent.UPDATE_STUDENT_BADGE,
      handler.onTeacherUpdateStudentBadge
    );
    handlers.set(
      TeacherWSEvent.UPDATE_BLACK_OUT,
      handler.onTeacherUpdateBlackOut
    );
    handlers.set(
      TeacherWSEvent.START_LESSON_PLAN,
      handler.onTeacherStartLessonPlan
    );
    handlers.set(
      TeacherWSEvent.END_LESSON_PLAN,
      handler.onTeacherEndLessonPlan
    );
    handlers.set(
      TeacherWSEvent.SET_ITEM_CONTENT_LESSON_PLAN,
      handler.onTeacherSetLessonPlanItemContent
    );
    handlers.set(
      TeacherWSEvent.CLEAR_RAISING_HAND,
      handler.onTeacherClearRaisingHand
    );
    handlers.set(
      TeacherWSEvent.UPDATE_LESSON_ACTION,
      handler.onTeacherUpdateClassAction
    );
    handlers.set(
      TeacherWSEvent.DESIGNATE_INTERACTIVE,
      handler.onTeacherDesignateTarget
    );
    handlers.forEach((func, key) => {
      this.hubConnection.on(key, (payload: any) => {
        Logger.info("RECIEVE", key, payload);
        func(payload);
      });
    });
  }
}

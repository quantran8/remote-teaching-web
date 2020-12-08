import { GLGlobal } from "@/commonui";
import { Logger } from "@/utils/logger";
import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";

export interface GLSocketOptions {
  url: string;
}

export enum RoomWSEvent {
  EVENT_ROOM_INFO = "EVENT_ROOM_INFO",
}

export enum TeacherWSEvent {
  JOIN_CLASS = "EVENT_TEACHER_JOIN_CLASS",
  STREAM_CONNECT = "EVENT_TEACHER_STREAM_CONNECT",
  MUTE_AUDIO = "EVENT_TEACHER_MUTE_AUDIO",
  MUTE_VIDEO = "EVENT_TEACHER_MUTE_VIDEO",
  MUTE_STUDENT_AUDIO = "EVENT_TEACHER_MUTE_AUDIO_STUDENT",
  MUTE_STUDENT_VIDEO = "EVENT_TEACHER_MUTE_VIDEO_STUDENT",
  MUTE_AUDIO_ALL_STUDENT = "EVENT_TEACHER_MUTE_AUDIO_ALL_STUDENT",
  MUTE_VIDEO_ALL_STUDENT = "EVENT_TEACHER_MUTE_VIDEO_ALL_STUDENT",
  END_CLASS = "EVENT_TEACHER_END_CLASS",
  DISCONNECT = "EVENT_TEACHER_DISCONNECT",
  SET_FOCUS_TAB = "EVENT_SET_FOCUS_TAB",

  UPDATE_GLOBAL_STUDENT_AUDIO = "EVENT_UPDATE_GLOBAL_STUDENT_AUDIO",
  UPDATE_STUDENT_AUDIO = "EVENT_UPDATE_STUDENT_AUDIO",
  UPDATE_STUDENT_BADGE = "EVENT_UPDATE_STUDENT_BADGE",
}
export enum StudentWSEvent {
  JOIN_CLASS = "EVENT_STUDENT_JOIN_CLASS",
  STREAM_CONNECT = "EVENT_STUDENT_STREAM_CONNECT",
  MUTE_AUDIO = "EVENT_STUDENT_MUTE_AUDIO",
  MUTE_VIDEO = "EVENT_STUDENT_MUTE_VIDEO",
  LEAVE = "EVENT_STUDENT_LEAVE",
  DISCONNECT = "EVENT_STUDENT_DISCONNECT",
}
export type WSEvent = RoomWSEvent | StudentWSEvent | TeacherWSEvent;

export interface RoomWSEventHandler {
  onRoomInfo(payload: any): void;
}
export interface StudentWSEventHandler {
  onStudentJoinClass(payload: any): void;
  onStudentStreamConnect(payload: any): void;
  onStudentMuteAudio(payload: any): void;
  onStudentMuteVideo(payload: any): void;
  onStudentLeave(payload: any): void;
  onStudentDisconnected(payload: any): void;
}

export interface TeacherWSEventHandler {
  onTeacherJoinClass(payload: any): void;
  onTeacherStreamConnect(payload: any): void;
  onTeacherMuteAudio(payload: any): void;
  onTeacherMuteVideo(payload: any): void;
  onTeacherMuteStudentVideo(payload: any): void;
  onTeacherMuteStudentAudio(payload: any): void;
  onTeacherMuteAllStudentVideo(payload: any): void;
  onTeacherMuteAllStudentAudio(payload: any): void;
  onTeacherEndClass(payload: any): void;
  onTeacherDisconnect(payload: any): void;
  onTeacherSetFocusTab(payload: any): void;
  onTeacherUpdateGlobalStudentAudio(payload: any): void;
  onTeacherUpdateStudentAudio(payload: any): void;
  onTeacherUpdateStudentBadge(payload: any): void;
}

export type WSEventHandler = RoomWSEventHandler &
  StudentWSEventHandler &
  TeacherWSEventHandler;

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

  init() {
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
  async disconnect() {
    if (!this.isConnected) return;
    return this._hubConnection?.stop();
  }
  async connect() {
    if (this.isConnected) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.hubConnection
        .start()
        .then((res) => {
          this._isConnected = true;
          resolve(res);
        })
        .catch((err) => {
          this._isConnected = false;
          reject(err);
        });
    });
  }
  async send(command: string, payload: any) {
    Logger.log("SEND", command, payload);
    if (!this.isConnected) {
      console.log("NOT CONNECTED");
      return;
    }

    return this.hubConnection
      .send(command, payload)
      .catch((err) => Logger.error("=======WSError=======", err));
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
      TeacherWSEvent.UPDATE_GLOBAL_STUDENT_AUDIO,
      handler.onTeacherUpdateGlobalStudentAudio
    );
    handlers.set(
      TeacherWSEvent.UPDATE_STUDENT_AUDIO,
      handler.onTeacherUpdateStudentAudio
    );
    handlers.set(
      TeacherWSEvent.UPDATE_STUDENT_BADGE,
      handler.onTeacherUpdateStudentBadge
    );
    handlers.forEach((func, key) => {
      this.hubConnection.on(key, (payload: any) => {
        Logger.info("RECIEVE", key, payload);
        func(payload);
      });
    });
  }
}

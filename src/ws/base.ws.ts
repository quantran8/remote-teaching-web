import { GLGlobal } from "@/commonui";
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
  EVENT_TEACHER_JOIN_CLASS = "EVENT_TEACHER_JOIN_CLASS",
  EVENT_TEACHER_STREAM_CONNECT = "EVENT_TEACHER_STREAM_CONNECT",
  EVENT_TEACHER_MUTE_AUDIO = "EVENT_TEACHER_MUTE_AUDIO",
  EVENT_TEACHER_MUTE_VIDEO = "EVENT_TEACHER_MUTE_VIDEO",
  EVENT_TEACHER_MUTE_STUDENT_AUDIO = "EVENT_TEACHER_MUTE_AUDIO_STUDENT",
  EVENT_TEACHER_MUTE_STUDENT_VIDEO = "EVENT_TEACHER_MUTE_VIDEO_STUDENT",
  EVENT_TEACHER_MUTE_AUDIO_ALL_STUDENT = "EVENT_TEACHER_MUTE_AUDIO_ALL_STUDENT",
  EVENT_TEACHER_MUTE_VIDEO_ALL_STUDENT = "EVENT_TEACHER_MUTE_VIDEO_ALL_STUDENT",
  EVENT_TEACHER_END_CLASS = "EVENT_TEACHER_END_CLASS",
  EVENT_TEACHER_DISCONNECT = "EVENT_TEACHER_DISCONNECT",
  EVENT_SET_FOCUS_TAB = "EVENT_SET_FOCUS_TAB",

  EVENT_UPDATE_GLOBAL_STUDENT_AUDIO = "EVENT_UPDATE_GLOBAL_STUDENT_AUDIO",
  EVENT_UPDATE_STUDENT_AUDIO = "EVENT_UPDATE_STUDENT_AUDIO",
  EVENT_UPDATE_STUDENT_BADGE = "EVENT_UPDATE_STUDENT_BADGE",
}
export enum StudentWSEvent {
  EVENT_STUDENT_JOIN_CLASS = "EVENT_STUDENT_JOIN_CLASS",
  EVENT_STUDENT_STREAM_CONNECT = "EVENT_STUDENT_STREAM_CONNECT",
  EVENT_STUDENT_MUTE_AUDIO = "EVENT_STUDENT_MUTE_AUDIO",
  EVENT_STUDENT_MUTE_VIDEO = "EVENT_STUDENT_MUTE_VIDEO",
  EVENT_STUDENT_LEAVE = "EVENT_STUDENT_LEAVE",
  EVENT_STUDENT_DISCONNECT = "EVENT_TEACHER_DISCONNECT",
}
export type WSEvent = RoomWSEvent & StudentWSEvent & TeacherWSEvent;
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
    this._hubConnection.on("EVENT_STUDENT_MUTE_VIDEO", (data) => {
      console.info("EVENT_STUDENT_MUTE_VIDEO", data);
    });
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect() {
    if (this.isConnected) return;
    return this.hubConnection
      .start()
      .then((res) => {
        this._isConnected = true;
        return res;
      })
      .catch((err) => {
        this._isConnected = false;
        console.log("WSError", err);
        return err;
      });
  }
  async send(command: string, payload: any) {
    console.log(`=======${command}=====`, payload);
    if (!this.isConnected) {
      console.log("NOT CONNECTED");
      return;
    }

    return this.hubConnection
      .send(command, payload)
      .catch((err) => console.error("WSError", err));
  }

  registerEventHandler(handler: WSEventHandler) {
    this.hubConnection.on(RoomWSEvent.EVENT_ROOM_INFO, handler.onRoomInfo);
    this.hubConnection.on(
      StudentWSEvent.EVENT_STUDENT_JOIN_CLASS,
      handler.onStudentJoinClass
    );
    this.hubConnection.on(
      StudentWSEvent.EVENT_STUDENT_STREAM_CONNECT,
      handler.onStudentStreamConnect
    );
    this.hubConnection.on(
      StudentWSEvent.EVENT_STUDENT_MUTE_AUDIO,
      handler.onStudentMuteAudio
    );
    this.hubConnection.on(
      StudentWSEvent.EVENT_STUDENT_MUTE_VIDEO,
      handler.onStudentMuteVideo
    );
    this.hubConnection.on(
      StudentWSEvent.EVENT_STUDENT_LEAVE,
      handler.onStudentLeave
    );
    this.hubConnection.on(
      StudentWSEvent.EVENT_STUDENT_DISCONNECT,
      handler.onStudentDisconnected
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_SET_FOCUS_TAB,
      handler.onTeacherSetFocusTab
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_DISCONNECT,
      handler.onTeacherDisconnect
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_END_CLASS,
      handler.onTeacherEndClass
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_JOIN_CLASS,
      handler.onTeacherJoinClass
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_MUTE_AUDIO,
      handler.onTeacherMuteAudio
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_MUTE_AUDIO_ALL_STUDENT,
      handler.onTeacherMuteAllStudentAudio
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_MUTE_STUDENT_AUDIO,
      handler.onTeacherMuteStudentAudio
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_MUTE_STUDENT_VIDEO,
      handler.onTeacherMuteStudentVideo
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_MUTE_VIDEO,
      handler.onTeacherMuteVideo
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_MUTE_VIDEO_ALL_STUDENT,
      handler.onTeacherMuteAllStudentVideo
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_TEACHER_STREAM_CONNECT,
      handler.onTeacherStreamConnect
    );

    this.hubConnection.on(
      TeacherWSEvent.EVENT_UPDATE_GLOBAL_STUDENT_AUDIO,
      handler.onTeacherUpdateGlobalStudentAudio
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_UPDATE_STUDENT_AUDIO,
      handler.onTeacherUpdateStudentAudio
    );
    this.hubConnection.on(
      TeacherWSEvent.EVENT_UPDATE_STUDENT_BADGE,
      handler.onTeacherUpdateStudentBadge
    );
  }
}

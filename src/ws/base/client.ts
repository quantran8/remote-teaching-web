import { ClassRoomStatus, SignalRStatus } from "@/models";
import { store } from "@/store";
import { Logger } from "@/utils/logger";
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { GLGlobal } from "vue-glcommonui";
import { RoomWSEvent, StudentWSEvent, TeacherWSEvent } from "..";
import { WSEvent, WSEventHandler } from "./event";
export interface GLSocketOptions {
  url: string;
  reConnectedCallback: () => Promise<any>;
}

const DEFAULT_RECONNECT_TIMING = 5000;

export class GLSocketClient {
  private _hubConnection?: HubConnection;
  private readonly _options?: GLSocketOptions;
  private _isConnected = false;
  private _listener: any = {};

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
    if (this._hubConnection) return;
    const options = {
      //skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
      //   logging: LogLevel.Trace,
      accessTokenFactory: () => GLGlobal.loginInfo().access_token,
    };
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(this.options.url, options)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          Logger.log("SIGNAL R DISCONNECTED");
          store.dispatch("setSignalRStatus", { status: SignalRStatus.Disconnected });
          return DEFAULT_RECONNECT_TIMING;
        },
      })
      .configureLogging(LogLevel.Debug)
      .build();
    //this._hubConnection.serverTimeoutInMilliseconds = 8000;
    //this._hubConnection.keepAliveIntervalInMilliseconds = 4000;
    this._hubConnection.onclose(this.onClosed);
    // this._hubConnection
    this._hubConnection.onreconnected(async (id: any) => {
      store.dispatch("setSignalRStatus", { status: SignalRStatus.NoStatus });
      await this._options?.reConnectedCallback();
    });
    const currentClassRoomStatus = store.getters["classRoomStatus"];
    const currentSignalRStatus = store.getters["signalRStatus"];
    if (currentClassRoomStatus === ClassRoomStatus.InClass && currentSignalRStatus === SignalRStatus.Closed) {
      store.dispatch("setSignalRStatus", { status: SignalRStatus.NoStatus });
    }
    this._isConnected = false;
  }
  onClosed(payload: any) {
    Logger.log("SIGNAL R CLOSED");
    const currentClassRoomStatus = store.getters["classRoomStatus"];
    if (currentClassRoomStatus === ClassRoomStatus.InClass) {
      store.dispatch("setSignalRStatus", { status: SignalRStatus.Closed });
    }
    this._isConnected = false;
  }
  get isConnected(): boolean {
    return this._isConnected;
  }
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    const keys = Object.keys(this._listener);
    keys.forEach((key) => {
      this.hubConnection.off(key);
    });
    return this._hubConnection?.stop();
  }
  async connect(): Promise<any> {
    if (this._isConnected) return Promise.resolve();
    if ([HubConnectionState.Connecting, HubConnectionState.Connected].includes(this.hubConnection.state)) return Promise.resolve();
    if (this.hubConnection.state === HubConnectionState.Connected) {
      return Promise.resolve();
    }
    try {
      await this.init();
      await this.hubConnection.start();
      Logger.log("Connected success");

      const currentClassRoomStatus = store.getters["classRoomStatus"];
      const currentSignalRStatus = store.getters["signalRStatus"];
      if (currentClassRoomStatus === ClassRoomStatus.InClass && currentSignalRStatus === SignalRStatus.Closed) {
        store.dispatch("setSignalRStatus", { status: SignalRStatus.NoStatus });
      }
      this._isConnected = true;
      store.dispatch("setSingalrInited", true);
      await this._options?.reConnectedCallback();
    } catch (error) {
      Logger.error(error);
      this._isConnected = false;
    }
  }
  async send(command: string, payload: any): Promise<any> {
    if (!this.hubConnection) {
      Logger.error("this.hubConnection: ", this.hubConnection);
    }
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Connected) {
      Logger.error("CONNECTION STATE: " + this.hubConnection.state);
    }
    if (!this.isConnected || !this.hubConnection || !this.hubConnection.state || this.hubConnection.state === HubConnectionState.Disconnected) {
      Logger.error("SEND/TRY-TO-RECONNECT-MANUALLY");
      this._isConnected = false;
      await this.connect();
    }
    if (this.hubConnection.state === HubConnectionState.Connected) {
      return this.hubConnection.send(command, payload);
    } else return Promise.resolve();
  }

  async invoke(command: string, payload: any): Promise<any> {
    if (!this.hubConnection) {
      Logger.error("this.hubConnection: ", this.hubConnection);
    }
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Connected) {
      Logger.error("CONNECTION STATE: " + this.hubConnection.state);
    }
    if (!this.isConnected || !this.hubConnection || !this.hubConnection.state || this.hubConnection.state === HubConnectionState.Disconnected) {
      Logger.error("INVOKE/TRY-TO-RECONNECT-MANUALLY");
      this._isConnected = false;
      await this.connect();
    }
    return this.hubConnection.invoke(command, payload);
  }

  registerEventHandler(handler: WSEventHandler) {
    const keys = Object.keys(this._listener);
    keys.forEach((key) => {
      this.hubConnection.off(key);
    });

    const handlers: Map<WSEvent, Function> = new Map<WSEvent, Function>();
    handlers.set(StudentWSEvent.JOIN_CLASS, handler.onStudentJoinClass);
    handlers.set(StudentWSEvent.STREAM_CONNECT, handler.onStudentStreamConnect);
    handlers.set(StudentWSEvent.MUTE_AUDIO, handler.onStudentMuteAudio);
    handlers.set(StudentWSEvent.MUTE_VIDEO, handler.onStudentMuteVideo);
    handlers.set(StudentWSEvent.LEAVE, handler.onStudentLeave);
    handlers.set(StudentWSEvent.DISCONNECT, handler.onStudentDisconnected);
    handlers.set(StudentWSEvent.EVENT_STUDENT_ANSWER_TARGET, handler.onStudentAnswerAll);
    handlers.set(StudentWSEvent.EVENT_STUDENT_ANSWER_CORRECT, handler.onStudentAnswerSelf);
    handlers.set(StudentWSEvent.EVENT_TEACHER_ANSWER_TARGET, handler.onStudentAnswerAll);
    handlers.set(StudentWSEvent.STUDENT_RAISING_HAND, handler.onStudentRaisingHand);
    handlers.set(StudentWSEvent.STUDENT_LIKE, handler.onStudentLike);
    handlers.set(StudentWSEvent.EVENT_STUDENT_UPDATE_SHAPE_LIST, handler.onStudentSetBrushstrokes);
    handlers.set(StudentWSEvent.EVENT_STUDENT_DRAWS_LINE, handler.onStudentDrawsLine);
    handlers.set(StudentWSEvent.EVENT_UPDATE_SHAPE, handler.onToggleShape);
    handlers.set(StudentWSEvent.STUDENT_SEND_CAPTURE_STATUS, handler.onStudentSendCapturedImageStatus);
    // handlers.set(
    //   StudentWSEvent.EVENT_STUDENT_SEND_UNITY,
    //   handler.onStudentSendUnity
    // );

    handlers.set(TeacherWSEvent.JOIN_CLASS, handler.onTeacherJoinClass);
    handlers.set(TeacherWSEvent.STREAM_CONNECT, handler.onTeacherStreamConnect);
    handlers.set(TeacherWSEvent.MUTE_AUDIO, handler.onTeacherMuteAudio);
    handlers.set(TeacherWSEvent.MUTE_VIDEO, handler.onTeacherMuteVideo);
    handlers.set(TeacherWSEvent.MUTE_STUDENT_VIDEO, handler.onTeacherMuteStudentVideo);
    handlers.set(TeacherWSEvent.MUTE_STUDENT_AUDIO, handler.onTeacherMuteStudentAudio);
    handlers.set(TeacherWSEvent.MUTE_VIDEO_ALL_STUDENT, handler.onTeacherMuteAllStudentVideo);
    handlers.set(TeacherWSEvent.MUTE_AUDIO_ALL_STUDENT, handler.onTeacherMuteAllStudentAudio);
    handlers.set(TeacherWSEvent.END_CLASS, handler.onTeacherEndClass);
    handlers.set(TeacherWSEvent.DISCONNECT, handler.onTeacherDisconnect);
    handlers.set(TeacherWSEvent.SET_TEACHING_MODE, handler.onTeacherSetTeachingMode);
    handlers.set(TeacherWSEvent.UPDATE_GLOBAL_AUDIO, handler.onTeacherUpdateGlobalAudio);
    handlers.set(TeacherWSEvent.UPDATE_LOCAL_AUDIO, handler.onTeacherUpdateLocalAudio);
    handlers.set(TeacherWSEvent.UPDATE_STUDENT_BADGE, handler.onTeacherUpdateStudentBadge);
    handlers.set(TeacherWSEvent.UPDATE_BLACK_OUT, handler.onTeacherUpdateBlackOut);
    handlers.set(TeacherWSEvent.START_LESSON_PLAN, handler.onTeacherStartLessonPlan);
    handlers.set(TeacherWSEvent.END_LESSON_PLAN, handler.onTeacherEndLessonPlan);
    handlers.set(TeacherWSEvent.SET_ITEM_CONTENT_LESSON_PLAN, handler.onTeacherSetLessonPlanItemContent);
    handlers.set(TeacherWSEvent.CLEAR_RAISING_HAND, handler.onTeacherClearRaisingHand);
    handlers.set(TeacherWSEvent.UPDATE_LESSON_ACTION, handler.onTeacherUpdateClassAction);
    handlers.set(TeacherWSEvent.DESIGNATE_INTERACTIVE, handler.onTeacherDesignateTarget);
    handlers.set(TeacherWSEvent.UPDATE_INTERACTIVE, handler.onTeacherUpdateDesignateTarget);
    handlers.set(TeacherWSEvent.EVENT_STUDENT_UPDATE_ANSWER_LIST, handler.onStudentUpdateAnswers);
    handlers.set(TeacherWSEvent.EVENT_UPDATE_POINTER, handler.onTeacherSetPointer);
    handlers.set(TeacherWSEvent.EVENT_ANNOTATION_UPDATE_MODE, handler.onTeacherUpdateAnnotationMode);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_ANNOTATION_ADD_BRUSHSTROKE, handler.onTeacherAddBrush);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_ANNOTATION_CLEAR_BRUSHSTROKE, handler.onTeacherClearAllBrush);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_ANNOTATION_DELETE_BRUSHSTROKE, handler.onTeacherDeleteBrush);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_ANNOTATION_SET_STICKER, handler.onTeacherSetStickers);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_ANNOTATION_CLEAR_STICKER, handler.onTeacherClearStickers);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_SET_WHITEBOARD, handler.onTeacherSetWhiteboard);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_SET_MEDIA_STATE, handler.onTeacherSetMediaState);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_SET_CURRENT_TIME_MEDIA, handler.onTeacherSetCurrentTimeMedia);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_DRAW_LASER_PEN, handler.onTeacherDrawLaser);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_DISABLE_PALETTE_ALL_STUDENT, handler.onTeacherDisableAllStudentPallete);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_RESET_PALETTE_ALL_STUDENT, handler.onTeacherResetPaletteAllStudent);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_UPDATE_STUDENT_PALETTE, handler.onTeacherToggleStudentPallete);
    // handlers.set(TeacherWSEvent.EVENT_TEACHER_ADD_SHAPE, handler.onTeacherAddShape);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_ANNOTATION_SET_BRUSHSTROKE, handler.onTeacherAddShape);
    handlers.set(TeacherWSEvent.EVENT_TEACHER_DRAW_PENCIL_PEN, handler.onTeacherDrawPencil);

    // handlers.set(
    //   TeacherWSEvent.EVENT_TEACHER_SEND_UNITY,
    //   handler.onTeacherSendUnity
    // );
    handlers.set(TeacherWSEvent.EVENT_TEACHER_SET_ONE_TO_ONE, handler.onTeacherSetOneToOne);
    handlers.set(TeacherWSEvent.TEACHER_CREATE_FABRIC_OBJECT, handler.onTeacherCreateFabricObject);
    handlers.set(TeacherWSEvent.TEACHER_MODIFY_FABRIC_OBJECT, handler.onTeacherModifyFabricObject);
    handlers.set(TeacherWSEvent.EVENT_UPDATE_ALL_SHAPES, handler.onToggleAllShapes);
    handlers.set(TeacherWSEvent.TEACHER_RESET_ZOOM, handler.onTeacherResetZoom);
    handlers.set(TeacherWSEvent.TEACHER_ZOOM_SLIDE, handler.onTeacherZoomSlide);
    handlers.set(TeacherWSEvent.TEACHER_MOVE_ZOOMED_SLIDE, handler.onTeacherMoveZoomedSlide);
    handlers.set(TeacherWSEvent.EVENT_UPDATE_SHAPE, handler.onToggleShape);
    handlers.set(RoomWSEvent.EVENT_ROOM_INFO, handler.onRoomInfo);

    handlers.set(TeacherWSEvent.TEACHER_UPDATE_SESSION_LESSON_AND_UNIT, handler.onTeacherUpdateSessionLessonAndUnit);
    handlers.set(TeacherWSEvent.CAPTURE_IMAGE, handler.onTeacherSendRequestCaptureImage);

    handlers.forEach((func, key) => {
      this.hubConnection.on(key, (payload: any) => {
        func(payload);
      });
      this._listener[key] = key;
    });
  }
}

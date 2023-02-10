import { store } from "@/store";
import { Logger } from "@/utils/logger";
import ZoomVideo, {
  ActiveSpeaker,
  CaptureVideoOption,
  ConnectionChangePayload,
  ConnectionState,
  Participant,
  ParticipantPropertiesPayload,
  Stream,
  Subsession2,
  SubsessionAllocationPattern,
  SubsessionClient,
  SubsessionStatus,
  SubsessionUserStatus,
  VideoClient,
  VideoQuality,
} from "@zoom/videosdk";
import { TeacherState } from "./../store/room/interface";
import { delay, getClassmatePositionAndSize, getStudentPositionAndSize } from "./video-helper";

export interface joinRoomOptions {
  studentId?: string;
  teacherId?: string;
  camera?: boolean;
  videoEncoderConfigurationPreset?: string;
  microphone?: boolean;
}
export interface ZoomClientSDK {
  joinRTCRoom(options: joinRoomOptions): void;
}

export interface ZoomClientOptions {
  user: ZoomUser;
}

export interface ZoomUser {
  channel: string;
  username: string;
  role: "host" | "audience";
  token: string;
}

export interface ZoomEventHandler {
  onLocalNetworkUpdate(payload: any): void;
}

export interface User {
  userId: number;
  displayName: string;
}

// 2160p: 3840x2160
// 1440p: 2560x1440
// 1080p: 1920x1080
// 720p: 1280x720
// 480p: 854x480
// 360p: 640x360
// 240p: 426x240

const HOST_CAPTURE_WIDTH = 1280;
const HOST_CAPTURE_HEIGHT = 720;

const CLIENT_CAPTURE_WIDTH = 640;
const CLIENT_CAPTURE_HEIGHT = 360;

const ONE_TO_ONE = "one-to-one";

export const PARTICIPANT_CANVAS_ID = "participant-videos-zoom";

export class ZoomClient implements ZoomClientSDK {
  _client?: typeof VideoClient;
  _stream?: typeof Stream;
  _options: ZoomClientOptions;
  _joinRoomOptions?: joinRoomOptions;
  _selfId?: number;
  _oneToOneStudentId?: string;
  _isInOneToOneRoom: boolean;
  _isInOneToOneProgress: boolean;
  _oneToOneToken?: string;
  _renderedList: Participant[];
  _subscribedVideos: number[];
  _previousSubscribedVideos: number[];
  _shouldAdjustLayout: boolean;
  _speakerTimeout: any = null;
  _isHost = false;
  _subSessionClient?: typeof SubsessionClient;
  _oneToOneSubsession?: Subsession2;

  joined = false;
  isMicEnable = false;
  isCameraEnable = false;
  inprogress = false;

  _isBeforeOneToOneCameraEnable = false;

  _defaultCaptureVideoOption: CaptureVideoOption;
  _selectedMicrophoneId?: string;
  _selectedCameraId?: string;
  _teacherId?: string;

  _isNotSupportSharedArrayBuffer: boolean;

  constructor(options: ZoomClientOptions) {
    this._options = options;
    this._oneToOneStudentId = undefined;
    this._isInOneToOneRoom = false;
    this._oneToOneToken = undefined;
    this._isInOneToOneProgress = false;
    this._renderedList = [];
    this._subscribedVideos = [];
    this._previousSubscribedVideos = [];
    this._shouldAdjustLayout = false;
    this._isHost = options.user.role === "host";
    this._selectedMicrophoneId = store.getters["microphoneDeviceId"];
    this._selectedCameraId = store.getters["cameraDeviceId"];
    this._teacherId = store.getters["studentRoom/teacher"]?.id;
    this._isNotSupportSharedArrayBuffer = !!(window as any).chrome && !(typeof SharedArrayBuffer === "function");

    this._defaultCaptureVideoOption = {
      hd: false,
      cameraId: this._selectedCameraId,
      captureWidth: options.user.role === "host" ? HOST_CAPTURE_WIDTH : CLIENT_CAPTURE_WIDTH,
      captureHeight: options.user.role === "host" ? HOST_CAPTURE_HEIGHT : CLIENT_CAPTURE_HEIGHT,
    };
  }

  get option() {
    return this._options as ZoomClientOptions;
  }

  get zoomRTC(): typeof ZoomVideo {
    return ZoomVideo;
  }

  set oneToOneToken(token: string) {
    this._oneToOneToken = token;
  }

  set oneToOneStudentId(studentId: string) {
    this._oneToOneStudentId = studentId;
  }

  async joinRTCRoom(options: joinRoomOptions) {
    try {
      this.isMicEnable = !!options.microphone;
      this.isCameraEnable = !!options.camera;
      this._client = this.zoomRTC.createClient();
      await this._client.init("en-US", "Global", {
        webEndpoint: "zoom.us",
        enforceMultipleVideos: window.crossOriginIsolated,
      });
      const token = this.option.user.token;
      const channel = this.option.user.channel;

      Logger.log("Join RTC room: ", { ...options, channel, token });

      await this._client.join(channel, token, this.option.user.username);
      this.joined = true;
      this._selfId = this._client?.getSessionInfo().userId;
      this._stream = this._client?.getMediaStream();
      this._subSessionClient = this._client.getSubsessionClient();

      if (this.isCameraEnable) {
        await this.setCamera({ enable: this.isCameraEnable });
      }
      await this.startAudio();

      this.registerListener();
      const users = this._client.getAllUser();
      if (users.length > 1) {
        this._shouldAdjustLayout = true;
      }
      await this.renderPeerVideos();
    } catch (error) {
      this.joined = false;
      Logger.error(error);
      this.zoomRTC.destroyClient();
      await this.joinRTCRoom(options);
    } finally {
      this._joinRoomOptions = options;
    }
  }

  onConnectionChange = (payload: ConnectionChangePayload) => {
    if (payload.state === ConnectionState.Connected) {
      Logger.log("connection-change", ConnectionState.Connected);
    } else if (payload.state === ConnectionState.Reconnecting) {
      Logger.log("connection-change", ConnectionState.Reconnecting);
    } else if (payload.state === ConnectionState.Closed) {
      this._renderedList = [];
      this._shouldAdjustLayout = true;
    }
  };

  userAdded = async (payload: ParticipantPropertiesPayload[]) => {
    await this.rerenderParticipantsVideo();
    this._shouldAdjustLayout = true;
    if (!this._isHost || !this._client?.getCurrentUserInfo()?.isHost) return;
    for (const element of payload) {
      const participant = this._client?.getAllUser().find((u) => u.userId === element.userId);
      if (participant) {
        Logger.log("User added: ", participant.displayName);
        if ((store.getters["studentRoom/teacher"] as TeacherState)?.id === participant.displayName) {
          await this._client?.makeHost(participant.userId);
          return;
        }
      }
    }
  };

  userUpdated = async (payload: ParticipantPropertiesPayload[]) => {
    if (payload.filter(({ userId }) => userId !== this._client?.getCurrentUserInfo()?.userId).some((participant) => "bVideoOn" in participant)) {
      await this.renderPeerVideos();
    }
  };

  userRemoved = async (payload: ParticipantPropertiesPayload[]) => {
    Logger.log("User removed: ", payload);
    for (const user of payload) {
      const participant = this._renderedList.find((u) => u.userId === user.userId);
      if (participant) {
        Logger.log("stop render user:", participant);
        await this.removeParticipantVideo(participant);
      }
    }
  };

  activeSpeaker = (payload: Array<ActiveSpeaker>) => {
    if (this._speakerTimeout) {
      clearTimeout(this._speakerTimeout);
    }
    const ids = payload.map(({ displayName }) => ({ uid: displayName, level: 1 }));
    if (this._isHost) {
      store.dispatch("teacherRoom/setSpeakingUsers", ids);
    } else {
      store.dispatch("studentRoom/setSpeakingUsers", ids);
    }
    this._speakerTimeout = setTimeout(() => {
      if (this._isHost) {
        store.dispatch("teacherRoom/setSpeakingUsers", []);
      } else {
        store.dispatch("studentRoom/setSpeakingUsers", []);
      }
    }, 1000);
  };
  onSubsessionStateChange = async ({ status }: any) => {
    if (status === SubsessionStatus.InProgress) {
      try {
        if (this._subSessionClient?.getCurrentSubsession().userStatus === SubsessionUserStatus.InSubsession) {
          if (this._isBeforeOneToOneCameraEnable) {
            Logger.log("Turn on my video again");
            if (this._isHost) {
              await store.dispatch("teacherRoom/setTeacherVideo", {
                id: this._options.user.username,
                enable: true,
              });
            } else {
              await store.dispatch("studentRoom/setStudentVideo", {
                id: this._options.user.username,
                enable: true,
              });
            }
            this._isBeforeOneToOneCameraEnable = false;
          }
        }
      } catch (error) {
        Logger.log(error);
      }
    }
    if (status === SubsessionStatus.Closed) {
      if (this._isBeforeOneToOneCameraEnable) {
        Logger.log("Turn on my video again");
        if (this._isHost) {
          await store.dispatch("teacherRoom/setTeacherVideo", {
            id: this._options.user.username,
            enable: true,
          });
        } else {
          await store.dispatch("studentRoom/setStudentVideo", {
            id: this._options.user.username,
            enable: true,
          });
        }
        if (this._stream?.isCapturingVideo()) {
          this._isBeforeOneToOneCameraEnable = false;
        }
      }
    }
  };
  mainSessionUserUpdated = async () => {
    const unassignUsers = this._subSessionClient?.getUnassignedUserList();
    const userOneToOne = unassignUsers?.find((user) => user.displayName === this._oneToOneStudentId);
    if (userOneToOne && userOneToOne.displayName) {
      this.assignUserToSubsession(userOneToOne.displayName);
    }
  };

  registerListener() {
    Logger.log("Register listener");
    this._client?.on("connection-change", this.onConnectionChange);
    this._client?.on("user-added", this.userAdded);
    this._client?.on("user-updated", this.userUpdated);
    this._client?.on("user-removed", this.userRemoved);
    this._client?.on("active-speaker", this.activeSpeaker);
    this._client?.on("subsession-state-change", this.onSubsessionStateChange);
    this._client?.on("main-session-user-updated", this.mainSessionUserUpdated);
  }

  removeListener() {
    try {
      Logger.log("Remove all listener");
      this._client?.off("connection-change", this.onConnectionChange);
      this._client?.off("user-added", this.userAdded);
      this._client?.off("user-updated", this.userUpdated);
      this._client?.off("user-removed", this.userRemoved);
      this._client?.off("active-speaker", this.activeSpeaker);
    } catch (error) {
      Logger.error(error);
    }
  }

  async removeParticipantVideo(user: Participant) {
    const shouldRemoveParticipant = this._renderedList.find(({ userId }) => userId === user.userId);
    if (!shouldRemoveParticipant) return;
    await this.stopRenderParticipantVideo(shouldRemoveParticipant);
    this._renderedList = this._renderedList.filter(({ userId }) => userId !== shouldRemoveParticipant.userId);
    await delay(200);
    await this.rerenderParticipantsVideo();
  }

  stopRenderParticipantVideo = async (user: Participant) => {
    try {
      const { userId, displayName } = user;
      const participantElementId = `${displayName}__sub`;
      const specialParticipantCanvas = document.getElementById(participantElementId) as HTMLCanvasElement;
      if (specialParticipantCanvas) {
        await this._stream?.stopRenderVideo(specialParticipantCanvas, userId);
        return;
      }
      const participantsCanvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
      if (participantsCanvas) {
        await this._stream?.stopRenderVideo(participantsCanvas, userId);
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  renderParticipantVideo = async (user: Participant) => {
    try {
      await this.updateCanvasDimension();
      const { userId, displayName } = user;
      const participantElementId = `${displayName}__sub`;
      const specialParticipantCanvas = document.getElementById(participantElementId) as HTMLCanvasElement;
      if (specialParticipantCanvas) {
        await this._stream?.renderVideo(
          specialParticipantCanvas,
          userId,
          specialParticipantCanvas.width,
          specialParticipantCanvas.height,
          0,
          0,
          VideoQuality.Video_360P,
        );
        return;
      }
      const participantsCanvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
      const position = this._isHost
        ? getStudentPositionAndSize(displayName, participantsCanvas)
        : getClassmatePositionAndSize(displayName, participantsCanvas);
      if (position && participantsCanvas) {
        const res = await this._stream?.renderVideo(
          participantsCanvas,
          userId,
          position.w,
          position.h,
          position.x,
          position.y,
          VideoQuality.Video_360P,
        );
      }
    } catch (error) {
      Logger.log("Render video error: ", error);
    }
  };

  rerenderParticipantsVideo = async () => {
    try {
      await this.updateCanvasDimension();
      for (const participant of this._renderedList) {
        const { userId, displayName } = participant;
        const participantElementId = `${displayName}__sub`;
        const specialParticipantCanvas = document.getElementById(participantElementId) as HTMLCanvasElement;
        if (specialParticipantCanvas) {
          await this._stream?.adjustRenderedVideoPosition(
            specialParticipantCanvas,
            userId,
            specialParticipantCanvas.width,
            specialParticipantCanvas.height,
            0,
            0,
          );
          continue;
        }
        const participantsCanvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
        const position = this._isHost
          ? getStudentPositionAndSize(displayName, participantsCanvas)
          : getClassmatePositionAndSize(displayName, participantsCanvas);
        if (position && participantsCanvas) {
          await this._stream?.adjustRenderedVideoPosition(participantsCanvas, userId, position.w, position.h, position.x, position.y);
        }
      }
    } catch (error) {
      Logger.log(error);
    }
  };

  updateCanvasDimension = async () => {
    try {
      const studentListElement = document.getElementById("student-list") as HTMLDivElement;
      const canvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
      if (!canvas) return;
      await this._stream?.updateVideoCanvasDimension(canvas, studentListElement.offsetWidth, studentListElement.offsetHeight);
    } catch (error) {
      Logger.error("Update canvas dimension", error);
    }
  };

  renderPeerVideos = async () => {
    const users = this._client?.getAllUser().filter(({ userId }) => userId !== this._client?.getCurrentUserInfo()?.userId) ?? [];
    if (!users.length && this._renderedList) {
      Logger.log("Remove all rendered students");
      for (const user of this._renderedList) {
        await this.stopRenderParticipantVideo(user);
      }
      this._renderedList = [];
    }
    const shouldRenderParticipants = users.filter(({ bVideoOn }) => bVideoOn);
    const shouldRemoveParticipants = users.filter(({ bVideoOn }) => !bVideoOn);

    const shouldAddedParticipants = shouldRenderParticipants.filter(
      ({ userId, displayName }) =>
        this._renderedList.findIndex(
          ({ userId: renderedId, displayName: renderedDisplayName }) => userId === renderedId || displayName === renderedDisplayName,
        ) === -1,
    );

    for (const user of shouldRemoveParticipants) {
      if (this._renderedList.find(({ displayName }) => displayName === user.displayName)) {
        Logger.log("Should remove: ", user.displayName);
        await this.stopRenderParticipantVideo(user);
      }
    }
    for (const user of shouldAddedParticipants) {
      Logger.log("Should render: ", user.displayName);
      await this.renderParticipantVideo(user);
    }
    this._renderedList = [...shouldRenderParticipants];

    Logger.log("Total rendered: ", this._renderedList.length);
    if (this._shouldAdjustLayout && shouldAddedParticipants.length) {
      await this.rerenderParticipantsVideo();
      this._shouldAdjustLayout = false;
    }
  };

  async stopAudio() {
    try {
      if (this.isMicEnable) {
        await this._stream?.stopAudio();
      }
    } catch (error) {
      Logger.error("Stop audio error: ", error);
    }
  }

  async muteAudio() {
    try {
      await this._stream?.muteAudio();
    } catch (error) {
      Logger.error("Mute audio error: ", error);
      await delay(200);
      await this._stream?.muteAudio();
    }
  }

  async selectMicrophone() {
    if (!this._selectedMicrophoneId) {
      const devices = await this.zoomRTC?.getDevices();
      const mics = devices.filter(function (device) {
        return device.kind === "audioinput";
      });
      if (!mics.length) {
        throw new Error("Cannot detect your microphone");
      }
      this._selectedMicrophoneId = mics[0].deviceId;
    }
    if (this._selectedMicrophoneId) {
      await this._stream?.switchMicrophone(this._selectedMicrophoneId);
    }
  }

  async startAudio() {
    try {
      await this._stream?.startAudio();
      await this.selectMicrophone();

      if (!this.isMicEnable) {
        // to avoid SDK not receiving media device
        await delay(200);
        await this.muteAudio();
      }
    } catch (error) {
      Logger.error("Start audio error: ", error);
    }
  }

  async setMicrophone(options: { enable: boolean }) {
    this.isMicEnable = options.enable;
    if (this.isMicEnable) {
      return this._stream?.unmuteAudio();
    } else {
      return this._stream?.muteAudio();
    }
  }

  async setCamera(options: { enable: boolean }) {
    this.isCameraEnable = options.enable;
    if (this.isCameraEnable) {
      await this.startRenderLocalUserVideo();
    } else {
      await this.stopRenderLocalUserVideo();
    }
  }

  async stopRenderLocalUserVideo() {
    Logger.log("Stop render local user video");
    try {
      if (this._stream?.isCapturingVideo()) await this._stream?.stopVideo();
    } catch (error) {
      Logger.error("Stop render local user video: ", error);
    }
  }

  async startRenderLocalUserVideo(element?: any) {
    try {
      if (!this._selectedCameraId) {
        const devices = await this.zoomRTC?.getDevices();
        const cams = devices.filter(function (device) {
          return device.kind === "videoinput";
        });
        if (!cams.length) {
          throw new Error("Cannot detect your camera");
        }
        this._selectedCameraId = cams[0].deviceId;
        this._defaultCaptureVideoOption.cameraId = this._selectedCameraId;
      }
      const mineVideoElementId = this.option.user.username + "__video";
      if (this._isNotSupportSharedArrayBuffer) {
        const video = document.getElementById(mineVideoElementId) as HTMLVideoElement;
        if (video) {
          await this._stream?.startVideo({ ...this._defaultCaptureVideoOption, videoElement: video });
        }
      } else {
        const canvas = document.getElementById(mineVideoElementId) as HTMLCanvasElement;
        if (canvas && this._selfId) {
          await this._stream?.startVideo(this._defaultCaptureVideoOption);
          await this._stream?.renderVideo(element ?? canvas, this._client?.getCurrentUserInfo().userId ?? 0, 400, 200, 0, 0, VideoQuality.Video_720P);
        }
      }
    } catch (error) {
      Logger.error("Start render local user video: ", error);
    }
  }

  async proactiveDisableVideos(id?: string) {
    try {
      if (!id) return;
      if (this.isCameraEnable) {
        Logger.log("Turn off my video");
        if (this._isHost) {
          await store.dispatch("teacherRoom/setTeacherVideo", {
            id,
            enable: false,
          });
        } else {
          await store.dispatch("studentRoom/setStudentVideo", {
            id,
            enable: false,
          });
        }
        this._isBeforeOneToOneCameraEnable = true;
      }
    } catch (error) {
      Logger.error("Proactive Disable Videos", error);
    }
  }

  async leaveSession(end = false) {
    try {
      if (this._isHost) {
        await this._client?.leave(end);
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async reset(end = false) {
    if (!end) {
      this.replaceVideoCanvas(this.option.user.username + "__video");
      // remove all students video
      await this.stopRenderAllParticipantVideosAndReplaceStudentsCanvas();
      // replace 1-1 or teacher canvas
      if (this._isHost) {
        this.replaceVideoCanvas(`${this._oneToOneStudentId}__sub`);
      } else {
        this.replaceVideoCanvas(`${this._teacherId}__sub`);
      }
    }
    Logger.log("Reset");
    this.isCameraEnable = false;
    this.isMicEnable = false;
    this.removeListener();
    if (this.isCameraEnable) {
      await this.stopRenderLocalUserVideo();
    }
    if (this.isMicEnable) {
      await this._stream?.stopAudio();
    }
    await this.leaveSession(end);
    this.joined = false;
    this._stream = undefined;
    this._client = undefined;
    this._isInOneToOneRoom = false;
    this._oneToOneToken = undefined;
    this._renderedList = [];

    this.zoomRTC.destroyClient();
  }

  // extensions
  getParticipantByDisplayName(displayName: string) {
    const users = this._client?.getAllUser();
    return users?.find((user) => user.displayName === displayName);
  }
  getOneToOneSubsession() {
    return this._subSessionClient?.getSubsessionList().find((session) => session.subsessionName === ONE_TO_ONE);
  }
  async createOneToOneSubSession() {
    try {
      const oneToOneSubSession = this.getOneToOneSubsession();
      if (!oneToOneSubSession) {
        await this._subSessionClient?.createSubsessions(ONE_TO_ONE, SubsessionAllocationPattern.Manually);
        Logger.log("create one to one subsession success");
        const subsession = this._subSessionClient?.getSubsessionList().find((session) => session.subsessionName === ONE_TO_ONE);
        this._oneToOneSubsession = subsession;
      } else {
        this._oneToOneSubsession = oneToOneSubSession;
      }
    } catch (error) {
      Logger.log(error);
    }
  }
  async assignUserToSubsession(userName: string) {
    const user = this._subSessionClient?.getUnassignedUserList().find((u) => u.displayName === userName);
    if (user && this._oneToOneSubsession) {
      this._oneToOneStudentId = userName;
      const isUnassigned = this._subSessionClient?.getUnassignedUserList().find((u) => u.userId === user.userId);
      if (isUnassigned) {
        await this._subSessionClient?.assignUserToSubsession(user.userId, this._oneToOneSubsession.subsessionId);
        Logger.log("assigned user");
      }
    }
  }
  async teacherJoinOneToOneSubSession(userName: string) {
    try {
      await this.createOneToOneSubSession();
      if (this._subSessionClient?.getSubsessionStatus() !== SubsessionStatus.InProgress) {
        await this._subSessionClient?.openSubsessions(this._subSessionClient?.getSubsessionList(), {
          isBackToMainSessionEnabled: true,
          isTimerAutoEnabled: false,
          isTimerEnabled: false,
          waitSeconds: 0,
        });
        Logger.log("opened one to one subsession");
      }
      if (this._oneToOneSubsession) {
        this.proactiveDisableVideos(this._options.user.username);
        await this.assignUserToSubsession(userName);
        await this._subSessionClient?.joinSubsession(this.getOneToOneSubsession()?.subsessionId ?? "");
        this.replaceVideoCanvas(this.option.user.username + "__video");
        await this.stopRenderAllParticipantVideosAndReplaceStudentsCanvas();
        await this.stopRenderLocalUserVideo();
        Logger.log("join subsession success");
      }
    } catch (error) {
      Logger.log(error);
    }
  }
  async studentJoinOneToOneSubSession() {
    try {
      const oneToOneSubSession = this.getOneToOneSubsession();
      if (oneToOneSubSession) {
        this._oneToOneSubsession = oneToOneSubSession;
        this.proactiveDisableVideos(this._options.user.username);
        // replace self canvas
        this.replaceVideoCanvas(this.option.user.username + "__video");
        // remove all students video
        await this.stopRenderAllParticipantVideosAndReplaceStudentsCanvas();
        // replace 1-1 or teacher canvas
        this.replaceVideoCanvas(`${this._teacherId}__sub`);
        await this.stopRenderLocalUserVideo();
        await this._subSessionClient?.joinSubsession(oneToOneSubSession.subsessionId);
        Logger.log("join subsession success");
      }
    } catch (error) {
      Logger.log(error);
    }
  }
  async backToMainSession() {
    try {
      this._oneToOneStudentId = undefined;
      //   await this.stopRenderLocalUserVideo();
      this.proactiveDisableVideos(this._options.user.username);
      await this.stopRenderAllParticipantVideosAndReplaceStudentsCanvas();
      this.replaceVideoCanvas(this.option.user.username + "__video");
      await this.stopRenderLocalUserVideo();
      if (this._isHost) {
        await this._subSessionClient?.closeAllSubsessions();
        Logger.log("close all subsession");
      } else {
        this.replaceVideoCanvas(`${this._teacherId}__sub`);
        await this._subSessionClient?.leaveSubsession();
      }
    } catch (error) {
      Logger.log(error);
    }
  }
  replaceVideoCanvas = (elementId: string) => {
    const canvas = document.getElementById(elementId) as HTMLCanvasElement;
    if (canvas) {
      Logger.log("replace canvas");
      const cloneCanvas = canvas.cloneNode();
      canvas.replaceWith(cloneCanvas);
    }
  };
  stopRenderAllParticipantVideosAndReplaceStudentsCanvas = async () => {
    Logger.log("Stop render all participant videos and replace students canvas");
    for (const user of this._renderedList) {
      await this.stopRenderParticipantVideo(user);
    }
    this._renderedList = [];

    const canvas = document.getElementById(PARTICIPANT_CANVAS_ID) as HTMLCanvasElement;
    await this._stream?.clearVideoCanvas(canvas);
    this.replaceVideoCanvas(PARTICIPANT_CANVAS_ID);
  };
}

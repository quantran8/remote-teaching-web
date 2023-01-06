import IconSpeakerStop from "@/assets/icons/pause-button.png";
import IconSpeakerPlay from "@/assets/icons/play-button.png";
import { ClassSetUp, DeviceTesterLocale, TeacherCalendarLocale } from "@/locales/localeid";
import { ClassRoomStatus, MediaStatus, StudentGroupModel, UnitAndLesson } from "@/models";
import { JoinSessionModel } from "@/models/join-session.model";
import { RemoteTeachingService, TeacherGetRoomResponse } from "@/services";
import { store } from "@/store";
import { VCPlatform } from "@/store/app/state";
import { InClassStatus, StudentState } from "@/store/room/interface";
import { Logger } from "@/utils/logger";
import { getListUnitByClassAndGroup } from "@/views/teacher-home/lesson-helper";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import ZoomVideo, { LocalAudioTrack, LocalVideoTrack } from "@zoom/videosdk";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Button, Divider, notification, Progress, Row, Select, Skeleton, Space, Spin, Switch } from "ant-design-vue";
import moment from "moment";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import { fmtMsg, RoleName } from "vue-glcommonui";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

interface DeviceType {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}
const fpPromise = FingerprintJS.load();
const refreshTiming = 1000;

export default defineComponent({
  components: {
    Progress,
    Select,
    SelectOption: Select.Option,
    Button,
    Skeleton,
    Divider,
    Row,
    Space,
    Spin,
    Switch,
  },
  async created() {
    const { dispatch } = useStore();
    dispatch("setMuteAudio", { status: MediaStatus.mediaNotLocked });
    dispatch("setHideVideo", { status: MediaStatus.mediaNotLocked });
  },
  setup() {
    const dateTime = ref(`${moment().format("dddd, MMMM DD, yyyy")}`);
    const SystemCheck = computed(() => fmtMsg(DeviceTesterLocale.SystemCheck));
    const CheckMic = computed(() => fmtMsg(DeviceTesterLocale.CheckMic));
    const SelectDevice = computed(() => fmtMsg(DeviceTesterLocale.SelectDevice));
    const CheckCam = computed(() => fmtMsg(DeviceTesterLocale.CheckCam));
    const TeacherVideoMirroring = computed(() => fmtMsg(DeviceTesterLocale.TeacherVideoMirroring));
    const StudentVideoMirroring = computed(() => fmtMsg(DeviceTesterLocale.StudentVideoMirroring));
    const CheckSpeaker = computed(() => fmtMsg(DeviceTesterLocale.CheckSpeaker));
    const groupText = computed(() => fmtMsg(TeacherCalendarLocale.GroupLabel));
    const Platform = computed(() => fmtMsg(DeviceTesterLocale.Platform));
    const CamOff = computed(() => fmtMsg(DeviceTesterLocale.CamOff));
    const ClassStatus = computed(() => fmtMsg(DeviceTesterLocale.ClassStatus));
    const DefaultMessage1 = computed(() => fmtMsg(DeviceTesterLocale.DefaultMessage1));
    const DefaultMessage2 = computed(() => fmtMsg(DeviceTesterLocale.DefaultMessage2));
    const JoinNow = computed(() => fmtMsg(DeviceTesterLocale.JoinNow));
    const LessonUnit = computed(() => fmtMsg(DeviceTesterLocale.LessonUnit));
    const Lesson = computed(() => fmtMsg(DeviceTesterLocale.Lesson));
    const Unit = computed(() => fmtMsg(DeviceTesterLocale.Unit));
    const Cancel = computed(() => fmtMsg(DeviceTesterLocale.Cancel));
    const JoinSession = computed(() => fmtMsg(DeviceTesterLocale.JoinSession));
    const warningMsgMicrophone = computed(() => fmtMsg(DeviceTesterLocale.MessageWarningMic));
    const warningMsgCamera = computed(() => fmtMsg(DeviceTesterLocale.MessageWarningCamera));
    const warningMsgSpeaker = computed(() => fmtMsg(DeviceTesterLocale.MessageWarningSpeaker));
    const MembersText = computed(() => fmtMsg(ClassSetUp.Members));
    const ActiveStudentsText = computed(() => fmtMsg(ClassSetUp.ActiveStudents));
    const InActiveStudentsText = computed(() => fmtMsg(ClassSetUp.InActiveStudents));
    const RemoteSetUpText = computed(() => fmtMsg(ClassSetUp.RemoteClassSetUp));
    const StartSessionText = computed(() => fmtMsg(ClassSetUp.StartSession));
    const messageErrorJoinSession = computed(() => fmtMsg(DeviceTesterLocale.MessageErrorJoinSession));
    const route = useRoute();
    const router = useRouter();
    const { role } = route.params;
    const { schoolName, campusName, className, groupName, classId, groupId, studentId } = route.query;
    const { getters, dispatch } = useStore();
    const havePermissionCamera = ref(true);
    const havePermissionMicrophone = ref(true);
    const isTeacherSetup = computed(() => (role as string).toLowerCase() === RoleName.teacher.toLowerCase() && isTeacher.value);
    const classOnline = computed(() => store.getters["teacher/getClassOnline"]);
    const unitInfo = ref<Array<UnitAndLesson>>([]);
    const getListLessonByUnit = async (classId: string, groupId: string) => {
      try {
        unitInfo.value = await getListUnitByClassAndGroup(classId, groupId);
      } catch (err) {
        const message = err?.body?.message;
        if (message) {
          notification.error({
            message: message,
          });
        }
      }
    };
    const students = computed<Array<StudentState>>(() => getters["studentRoom/students"]);
    const classSetUpStudents = computed<Array<StudentGroupModel>>(() => getters["teacher/classSetUpStudents"]);
    const activeStudents = computed<Array<StudentGroupModel>>(() => classSetUpStudents.value.filter((st) => st.isActivated));
    const inActiveStudents = computed<Array<StudentGroupModel>>(() => classSetUpStudents.value.filter((st) => !st.isActivated));

    const isTeacher = computed<boolean>(() => getters["auth/isTeacher"]);
    const isParent = computed(() => getters["auth/isParent"]);
    const visible = ref(false);
    const isOpenMic = ref<boolean>(true);
    const isOpenCam = ref<boolean>(true);
    const isTeacherVideoMirror = ref<boolean>(true);
    const isStudentVideoMirror = ref<boolean>(true);
    const platform = computed(() => getters["platform"]);
    const localTracks = ref<any>(null);
    const listMics = ref<DeviceType[]>([]);
    const listMicsId = ref<string[]>([]);
    const listCams = ref<DeviceType[]>([]);
    const listCamsId = ref<string[]>([]);
    const playerRef = ref();
    const currentMic = ref<DeviceType>();
    const currentMicLabel = ref();
    const currentCam = ref<DeviceType>();
    const currentCamLabel = ref();
    const volumeByPercent = ref(0);
    const volumeAnimation = ref();
    const videoElementId = "pre-local-player";
    const agoraError = ref(false);
    const agoraMicError = ref(false);
    const agoraCamError = ref(false);
    const isConfigTrackingDone = ref(false);
    const loading = ref(false);
    const messageStartClass = ref("");

    const zoomMicError = ref(false);
    const zoomCamError = ref(false);
    const firstTimeDefault = ref(true);
    const currentUnit = ref();
    const currentPlatform = ref<number>(platform.value);
    const isUsingAgora = ref<boolean>(platform.value === VCPlatform.Agora);
    const currentLesson = ref();
    const listLessonByUnit = ref();
    const preventCloseModal = ref(true);
    const devices = ref<MediaDeviceInfo[]>([]);
    const audio = ref<any>(null);
    const listSpeakers = ref<DeviceType[]>([]);
    const listSpeakersId = ref<string[]>([]);
    const currentSpeaker = ref<DeviceType>();
    const currentSpeakerLabel = ref();
    const isPlayingSound = ref(false);
    const isCheckSpeaker = ref(true);
    const isPlaySpeaker = ref(false);
    const speakerIcon = computed(() => (isPlaySpeaker.value ? IconSpeakerStop : IconSpeakerPlay));
    const toggleSpeaker = async () => {
      if (!listSpeakers.value.length || !currentSpeaker.value) {
        return;
      }
      audio.value = document.getElementById("audio");
      isPlaySpeaker.value = !isPlaySpeaker.value;
      if (isPlaySpeaker.value && audio.value) {
        await audio.value.setSinkId(currentSpeaker.value?.deviceId);
        audio.value.play();
      } else {
        audio.value.pause();
        audio.value.currentTime = 0;
      }
      isPlayingSound.value = !audio.value.paused;
    };
    const listPlatform = [
      { key: VCPlatform.Agora, name: VCPlatform[1] },
      { key: VCPlatform.Zoom, name: VCPlatform[2] },
    ];

    const openCamera = async () => {
      await localTracks.value?.videoTrack.play(videoElementId, {
        mirror: true,
      });
    };

    const setupAgora = async () => {
      let audioTrack = null;
      let videoTrack = null;
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        havePermissionCamera.value = true;
      } catch (error) {
        Logger.log("setupAgora error when create videoTrack =>", error);
        if (error?.code === "PERMISSION_DENIED") havePermissionCamera.value = false;
        preventCloseModal.value = false;
        agoraCamError.value = true;
      }
      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        havePermissionMicrophone.value = true;
      } catch (error) {
        Logger.log("setupAgora error when create audioTrack =>", error);
        if (error?.code === "PERMISSION_DENIED") havePermissionMicrophone.value = false;
        preventCloseModal.value = false;
        agoraMicError.value = true;
      }
      localTracks.value = {
        audioTrack,
        videoTrack,
      };
    };

    const setupZoom = async () => {
      let audioTrack: LocalAudioTrack | null = null;
      let videoTrack: LocalVideoTrack | null = null;
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        Logger.error("Get user audio: ", error);
        if (error?.name === "NotAllowedError") {
          havePermissionMicrophone.value = false;
        }
      }
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        Logger.error("Get user camera: ", error);
        if (error?.name === "NotAllowedError") {
          havePermissionCamera.value = false;
        }
      }
      try {
        devices.value = await ZoomVideo.getDevices();
      } catch (error) {
        Logger.error("Get user devices: ", error);
        devices.value = await ZoomVideo.getDevices(true);
      }
      Logger.log("Setup camera");
      if (havePermissionCamera.value) {
        try {
          const cams = devices.value.filter(function (device) {
            return device.kind === "videoinput";
          });
          if (cams.length && havePermissionCamera.value) {
            currentCam.value = cams[0];
            currentCamLabel.value = cams[0]?.label;
            listCams.value = cams;
            listCamsId.value = cams.map((cam) => cam.deviceId);
            videoTrack = ZoomVideo.createLocalVideoTrack(cams[0].deviceId);
          }
        } catch (error) {
          Logger.log("SetupZoom error when create videoTrack =>", error);
          if (error?.code === "PERMISSION_DENIED") havePermissionCamera.value = false;
          preventCloseModal.value = false;
          zoomCamError.value = true;
        }
      }

      Logger.log("Setup microphone");
      if (havePermissionMicrophone.value) {
        try {
          const mics = devices.value.filter(function (device) {
            return device.kind === "audioinput";
          });
          if (mics.length && havePermissionMicrophone.value) {
            currentMic.value = mics[0];
            currentMicLabel.value = mics[0]?.label;
            listMics.value = mics;
            listMicsId.value = mics.map((mic) => mic.deviceId);
            audioTrack = ZoomVideo.createLocalAudioTrack(mics[0].deviceId);
          }
        } catch (error) {
          Logger.log("SetupZoom error when create audioTrack =>", error);
          if (error?.code === "PERMISSION_DENIED") havePermissionMicrophone.value = false;
          preventCloseModal.value = false;
          zoomMicError.value = true;
        }
        Logger.log("Setup zoom media done");
        localTracks.value = {
          audioTrack,
          videoTrack,
        };
      }
    };

    const setupZoomTracking = async () => {
      Logger.log("Setup zoom media tracking");
      try {
        const doc = document.getElementById(videoElementId) as HTMLVideoElement;
        if (havePermissionMicrophone.value && currentCam.value) {
          await localTracks.value?.videoTrack?.start(doc);
        }
        if (havePermissionMicrophone.value && currentMic.value) {
          await localTracks.value?.audioTrack?.start();
          await localTracks.value?.audioTrack?.unmute();
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }

        preventCloseModal.value = false;
        Logger.log("Setup zoom media tracking done");
      } catch (error) {
        Logger.log("Setup zoom tracking failed: ", error.massage);
        preventCloseModal.value = false;
        Logger.log(error);
      }
      isConfigTrackingDone.value = true;
    };

    const setupDevice = async () => {
      try {
        const cams = await AgoraRTC.getCameras();
        if (cams.length) {
          let camSelected = cams[0];
          const localStorageCamId = localStorage.getItem("camId");
          if (localStorageCamId) {
            camSelected = cams.find((device: any) => device.deviceId === localStorageCamId) ?? cams[0];
          }
          currentCam.value = camSelected;
          currentCamLabel.value = camSelected?.label;

          listCams.value = cams;
          listCamsId.value = cams.map((cam) => cam.deviceId);
          await localTracks.value.videoTrack.setDevice(camSelected?.deviceId);
          try {
            await openCamera();
            preventCloseModal.value = false;
          } catch (error) {
            preventCloseModal.value = false;
            Logger.log("Error when play video => ", error);
          }
        } else {
          preventCloseModal.value = false;
        }
      } catch (error) {
        Logger.log("setupCam error => ", error);
        agoraCamError.value = true;
      }
      try {
        const mics = await AgoraRTC.getMicrophones();
        if (mics.length) {
          let micSelected = mics[0];
          const localStorageMicId = localStorage.getItem("micId");
          if (localStorageMicId) {
            micSelected = mics.find((device: any) => device.deviceId === localStorageMicId) ?? mics[0];
          }
          currentMic.value = micSelected;
          currentMicLabel.value = micSelected?.label;

          listMics.value = mics;
          listMicsId.value = mics.map((mic) => mic.deviceId);
          await localTracks.value?.audioTrack.setDevice(micSelected?.deviceId);
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      } catch (error) {
        Logger.log("setupMic error => ", error);
        agoraMicError.value = true;
      }
      try {
        const speakersOrigin = await AgoraRTC.getPlaybackDevices();
        const speakers: DeviceType[] = speakersOrigin.map((speaker) => {
          if (speaker.deviceId === "default") {
            const defaultDevice = {
              deviceId: speaker.deviceId,
              groupId: speaker.groupId,
              kind: speaker.kind,
              label: "Default Device",
            };
            return defaultDevice;
          }
          return speaker;
        });
        if (speakers.length) {
          listSpeakers.value = speakers;
          listSpeakersId.value = speakers.map((speaker: any) => speaker.deviceId);
          currentSpeaker.value = speakers[0];
          currentSpeakerLabel.value = speakers[0].label;
        }
      } catch (error) {
        Logger.log(error.message);
      }
    };

    const setupUnitAndLesson = () => {
      const unitDefault = unitInfo.value.length ? unitInfo.value[unitInfo.value.length - 1].unit : 1;
      const currentUnitIndex = unitInfo.value.findIndex((item: UnitAndLesson) => item.unit === unitDefault);
      currentUnit.value = unitInfo.value[currentUnitIndex]?.unit;
      listLessonByUnit.value = unitInfo.value[currentUnitIndex].sequence;
      currentLesson.value = listLessonByUnit.value[listLessonByUnit.value.length - 1];
    };

    const handleHotPluggingMicro = async (newMicroId?: string) => {
      try {
        const mics = await AgoraRTC.getMicrophones();
        const newMicro = mics.find(({ deviceId }) => deviceId === newMicroId);

        // check if the old microphone is working
        let oldMicro = undefined;
        if (newMicroId) {
          oldMicro = mics.find(({ deviceId }) => currentMic.value?.deviceId === deviceId);
        }
        if (mics.length) {
          currentMic.value = newMicro ?? oldMicro ?? mics[0];
          currentMicLabel.value = currentMic.value?.label;
          listMics.value = mics;
          listMicsId.value = mics.map((mic) => mic.deviceId);
          await localTracks.value?.audioTrack.setDevice(currentMic.value?.deviceId);
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      } catch (error) {
        Logger.log("setupMic error => ", error);
        agoraMicError.value = true;
      }
    };

    const handleHotPluggingCamera = async (newCameraId?: string) => {
      try {
        const cams = await AgoraRTC.getCameras();
        const newCamera = cams.find(({ deviceId }) => deviceId === newCameraId);

        // check if the old camera is working
        let oldCamera = undefined;
        if (newCameraId) {
          oldCamera = cams.find(({ deviceId }) => currentCam.value?.deviceId === deviceId);
        }
        if (cams.length) {
          currentCam.value = newCamera ?? oldCamera ?? cams[0];
          currentCamLabel.value = currentCam.value?.label;
          listCams.value = cams;
          listCamsId.value = cams.map((cam) => cam.deviceId);
          await localTracks.value.videoTrack.setDevice(currentCam.value?.deviceId);
          try {
            await openCamera();
            preventCloseModal.value = false;
          } catch (error) {
            preventCloseModal.value = false;
            Logger.log("Error when play video => ", error);
          }
        }
      } catch (error) {
        Logger.log("setupCam error => ", error);
        agoraCamError.value = true;
      }
    };

    const onHotMicroPluggingDevice = async (changedDevice: any) => {
      if (changedDevice.state === "ACTIVE") {
        await handleHotPluggingMicro(changedDevice.device.deviceId);
      } else {
        await handleHotPluggingMicro();
      }
    };
    const onHotCameraPluggingDevice = async (changedDevice: any) => {
      if (changedDevice.state === "ACTIVE") {
        await handleHotPluggingCamera(changedDevice.device.deviceId);
      } else {
        await handleHotPluggingCamera();
      }
    };

    const setupEvent = () => {
      AgoraRTC.onCameraChanged = onHotCameraPluggingDevice;
      AgoraRTC.onMicrophoneChanged = onHotMicroPluggingDevice;
      isConfigTrackingDone.value = true;
    };

    const cancelVolumeAnimation = () => {
      cancelAnimationFrame(volumeAnimation.value);
      volumeAnimation.value = null;
      volumeByPercent.value = 0;
    };

    const initialSetup = async () => {
      if (isUsingAgora.value) {
        await setupAgora();
        await setupDevice();
        setupEvent();
      } else {
        await setupZoom();
        await setupZoomTracking();
      }
    };

    watch(currentMic, async (currentMicValue) => {
      try {
        if (!isConfigTrackingDone.value) return;
        if (!localTracks.value?.audioTrack) return;
        if (!havePermissionMicrophone.value) return;
        if (currentMicValue) {
          if (isUsingAgora.value) {
            await localTracks.value?.audioTrack.setEnabled(true);
          } else {
            const thisMic = listMics.value.find(({ deviceId }) => deviceId === currentMicValue.deviceId) || listMics.value[0];
            await localTracks.value?.audioTrack.stop();
            localTracks.value["audioTrack"] = ZoomVideo.createLocalAudioTrack(thisMic.deviceId);
            await localTracks.value?.audioTrack.start();
            if (isOpenMic.value) {
              await localTracks.value?.audioTrack.unmute();
            }
          }
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      } catch (error) {
        Logger.log(error.message);
      }
    });

    watch(currentCam, async (currentCamValue) => {
      try {
        if (!isConfigTrackingDone.value) return;
        if (!localTracks.value?.videoTrack) return;
        if (!havePermissionCamera.value) return;

        if (currentCamValue) {
          if (isUsingAgora.value) {
            await openCamera();
            await localTracks.value?.videoTrack.setEnabled(true);
          } else {
            const thisCam = listCams.value.find(({ deviceId }) => deviceId === currentCamValue.deviceId) || listCams.value[0];
            await localTracks.value?.videoTrack.stop();
            localTracks.value["videoTrack"] = ZoomVideo.createLocalVideoTrack(thisCam.deviceId);
            if (isOpenCam.value) {
              const doc = document.getElementById(videoElementId) as HTMLVideoElement;
              await localTracks.value?.videoTrack.start(doc);
            }
          }
        }
      } catch (error) {
        Logger.log(error.message);
      }
    });

    //handle for camera
    watch(isOpenCam, async (currentIsOpenCamValue) => {
      if (currentIsOpenCamValue) {
        dispatch("setHideVideo", { status: MediaStatus.mediaNotLocked });
        if (currentCam.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.videoTrack.setEnabled(true);
          } else {
            const doc = document.getElementById(videoElementId) as HTMLVideoElement;
            await localTracks.value?.videoTrack.start(doc);
          }
        }
      }
      if (!currentIsOpenCamValue) {
        dispatch("setHideVideo", { status: MediaStatus.mediaLocked });
        if (currentCam.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.videoTrack.setEnabled(false);
          } else {
            await localTracks.value?.videoTrack.stop();
          }
        }
      }
    });

    //handle for microphone
    watch(isOpenMic, async (currentIsOpenMic) => {
      if (currentIsOpenMic) {
        dispatch("setMuteAudio", { status: MediaStatus.mediaNotLocked });
        if (currentMic.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.audioTrack?.setEnabled(true);
          } else {
            await localTracks.value?.audioTrack?.unmute();
          }
          if (!volumeAnimation.value) {
            volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
          }
        }
      }
      if (!currentIsOpenMic) {
        dispatch("setMuteAudio", { status: MediaStatus.mediaLocked });
        if (volumeAnimation.value) {
          cancelVolumeAnimation();
        }
        if (currentMic.value) {
          if (isUsingAgora.value) {
            await localTracks.value?.audioTrack.setEnabled(false);
          } else {
            await localTracks.value?.audioTrack.mute();
          }
        }
      }
    });

    //handle for speaker
    watch(isCheckSpeaker, () => {
      if (audio.value) {
        if (isCheckSpeaker.value) {
          audio.value.play();
        } else {
          audio.value.pause();
          audio.value.currentTime = 0;
        }
        isPlayingSound.value = !audio.value.paused;
      }
    });

    const setVolumeWave = () => {
      if (!localTracks.value) return;
      volumeAnimation.value = window.requestAnimationFrame(setVolumeWave);
      volumeByPercent.value = isUsingAgora.value
        ? localTracks.value?.audioTrack.getVolumeLevel() * 100
        : localTracks.value?.audioTrack.getCurrentVolume() * 100;
    };

    const handleMicroChange = async (micId: string) => {
      try {
        if (isUsingAgora.value) {
          await localTracks.value?.audioTrack.setDevice(micId);
        }
        currentMic.value = listMics.value.find((mic) => mic.deviceId === micId);
        if (currentMic.value && currentMic.value.deviceId) localStorage.setItem("micId", currentMic.value.deviceId);
      } catch (error) {
        Logger.log("Error => ", error);
      }
    };

    const handleCameraChange = async (camId: any) => {
      try {
        if (isUsingAgora.value) {
          await localTracks.value.videoTrack.setDevice(camId);
        }
        currentCam.value = listCams.value.find((cam) => cam.deviceId === camId);
        if (currentCam.value && currentCam.value.deviceId) localStorage.setItem("camId", currentCam.value.deviceId);
      } catch (error) {
        Logger.log("Error => ", error);
      }
    };

    const handleSpeakerChange = async (speakerId: string) => {
      audio.value = document.getElementById("audio");
      currentSpeaker.value = listSpeakers.value.find((speaker) => speaker.deviceId === speakerId);
      if (audio.value) {
        await audio.value.setSinkId(currentSpeaker.value?.deviceId);
        audio.value.pause();
        audio.value.currentTime = 0;
        audio.value.play();
      } else {
        audio.value.pause();
        audio.value.currentTime = 0;
      }
      isPlayingSound.value = !audio.value.paused;
      isPlaySpeaker.value = !audio.value.paused;
    };

    const destroySDK = async (isAgora: boolean) => {
      isConfigTrackingDone.value = false;
      if (audio.value && !audio.value.paused) {
        audio.value.pause();
        audio.value.currentTime = 0;
        isPlayingSound.value = false;
      }

      if (volumeAnimation.value) {
        cancelVolumeAnimation();
      }
      try {
        if (isOpenMic.value) {
          if (isAgora) {
            await localTracks.value?.audioTrack?.close();
          } else {
            await localTracks.value?.audioTrack?.stop();
          }
        }
      } catch (error) {
        Logger.log(error.message);
      }
      try {
        if (isOpenCam.value) {
          if (isAgora) {
            await localTracks.value?.videoTrack?.close();
            AgoraRTC.onCameraChanged = undefined;
            AgoraRTC.onMicrophoneChanged = undefined;

            agoraError.value = false;
            agoraCamError.value = false;
            agoraMicError.value = false;
          } else {
            await localTracks.value?.videoTrack?.stop();
          }
        }
      } catch (error) {
        Logger.log(error.message);
      }

      localTracks.value = undefined;

      currentMic.value = undefined;
      currentCam.value = undefined;
      isOpenMic.value = true;
      isOpenCam.value = true;

      currentSpeaker.value = undefined;
      isCheckSpeaker.value = true;
      isPlaySpeaker.value = false;
      isPlayingSound.value = false;

      isTeacherVideoMirror.value = true;
      isStudentVideoMirror.value = true;

      havePermissionCamera.value = true;
      havePermissionMicrophone.value = true;

      Logger.log("Destroy SDK");
    };

    const destroy = async () => {
      await destroySDK(isUsingAgora.value);
      preventCloseModal.value = true;
      currentUnit.value = null;
      currentLesson.value = null;
      firstTimeDefault.value = true;
    };

    watch(visible, async (currentValue) => {
      if (!currentValue) {
        await destroy();
        return;
      }
      await initialSetup();
    });

    const goToClass = async () => {
      await store.dispatch("setClassRoomStatus", { status: ClassRoomStatus.InClass });
      router.push(`/student/${studentId}/class/${classId}`);
    };

    const handleGoToClassSuccess = () => {
      dispatch("setCameraDeviceId", currentCam.value?.deviceId ?? "");
      dispatch("setMicrophoneDeviceId", currentMic.value?.deviceId ?? "");
      if (isUsingAgora.value) {
        localTracks.value?.audioTrack?.close();
        localTracks.value?.videoTrack?.close();
      } else {
        localTracks.value?.audioTrack?.stop();
        localTracks.value?.videoTrack?.stop();
      }
    };

    const handleUnitChange = (unit: any) => {
      currentUnit.value = unit;
      const currentUnitIndex = unitInfo.value?.findIndex((item: UnitAndLesson) => item.unit === unit);
      listLessonByUnit.value = unitInfo.value[currentUnitIndex]?.sequence;
      const availableLessons = unitInfo.value[currentUnitIndex]?.sequence;
      currentLesson.value = unitInfo.value[currentUnitIndex].sequence[availableLessons.length - 1];
    };

    const handleLessonChange = (lesson: any) => {
      currentLesson.value = lesson;
    };

    const handleSubmit = async () => {
      if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
      }
      if (isTeacherSetup.value) {
        const unitId = unitInfo.value?.find((unit: UnitAndLesson) => unit.unit === currentUnit.value)?.unitId ?? "";
        if (!unitId) return;
        if (!(await joinTheCurrentSession(groupId as string))) {
          await startClass(classId as string, groupId as string, currentUnit.value, currentLesson.value, unitId);
        }
      } else {
        goToClass();
      }
    };
    const handleCancel = () => {
      if (isTeacherSetup.value) {
        router.push("/teacher");
      } else {
        router.push("/parent");
      }
    };
    const startClass = async (
      classId: string,
      groupId: string,
      unit: number,
      lesson: number,
      unitId: number,
      isTeacherVideoMirror = true,
      isStudentVideoMirror = true,
    ) => {
      messageStartClass.value = "";
      try {
        const fp = await fpPromise;
        const result = await fp.get();
        const resolution = screen.width * window.devicePixelRatio + "x" + screen.height * window.devicePixelRatio;
        const model: JoinSessionModel = {
          classId,
          groupId,
          resolution,
          unit: unit,
          lesson: lesson,
          browserFingerprint: result.visitorId,
          unitId,
          videoPlatformProvider: VCPlatform.Agora,
          isTeacherVideoMirror,
          isStudentVideoMirror,
        };
        const response = await RemoteTeachingService.teacherStartClassRoom(model);
        if (response && response.success) {
          await store.dispatch("setClassRoomStatus", { status: ClassRoomStatus.InClass });
          await router.push("/class/" + classId);
        }
      } catch (err) {
        const message = err?.body?.message;
        if (message) {
          messageStartClass.value = message;
        }
      }
    };

    const joinTheCurrentSession = async (currentGroupId: string) => {
      if (classOnline.value && currentGroupId == classOnline.value.groupId) {
        return true;
      }
      return false;
    };

    watch(currentPlatform, async (currentValue) => {
      isUsingAgora.value = currentValue === VCPlatform.Agora;

      await destroySDK(!isUsingAgora.value);

      Logger.log("Platform changed");
      dispatch("setVideoCallPlatform", currentValue);
      await initialSetup();
    });

    const getRoomInfoTimeout = ref<null | ReturnType<typeof setTimeout>>(null);
    const classIsActive = ref(false);
    const isDisabledJoinBtn = ref(!isTeacherSetup.value);

    const onClickChild = async (student: string) => {
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      const getRoomInfo = async () => {
        try {
          const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.studentGetRoomInfo(student, visitorId);
          await store.dispatch("studentRoom/setOnline");
          await store.dispatch("setVideoCallPlatform", roomResponse.data.videoPlatformProvider);
          await dispatch("studentRoom/setRoomInfo", roomResponse.data);
          if (getRoomInfoTimeout.value) {
            clearTimeout(getRoomInfoTimeout.value);
            getRoomInfoTimeout.value = null;
          }
          classIsActive.value = true;
          isDisabledJoinBtn.value = false;
          const studentIsJoined = students.value.find((item) => item.id === student);
          if (studentIsJoined && studentIsJoined.status === InClassStatus.JOINED) {
            messageStartClass.value = messageErrorJoinSession.value;
            isDisabledJoinBtn.value = true;
          }
        } catch (err) {
          messageStartClass.value = err.message;
          isDisabledJoinBtn.value = true;
          if (classIsActive.value) {
            classIsActive.value = false;
          }
          if (err?.code === 0) {
            getRoomInfoTimeout.value = setTimeout(() => {
              getRoomInfo();
            }, refreshTiming);
          }
        }
      };
      await getRoomInfo();
    };

    onMounted(async () => {
      initialSetup();
      if (isTeacherSetup.value) {
        await getListLessonByUnit(classId as string, groupId as string);
        await dispatch("teacher/getGroupStudents", { classId, groupId });
        setupUnitAndLesson();
      } else {
        onClickChild(studentId as string);
      }
    });

    onUnmounted(async () => {
      AgoraRTC.onMicrophoneChanged = undefined;
      AgoraRTC.onCameraChanged = undefined;
      if (getRoomInfoTimeout.value) {
        clearTimeout(getRoomInfoTimeout.value);
        getRoomInfoTimeout.value = null;
      }
      await destroy();
    });

    return {
      MembersText,
      ActiveStudentsText,
      InActiveStudentsText,
      RemoteSetUpText,
      StartSessionText,
      warningMsgMicrophone,
      warningMsgCamera,
      havePermissionCamera,
      havePermissionMicrophone,
      SystemCheck,
      CheckMic,
      SelectDevice,
      CheckCam,
      TeacherVideoMirroring,
      StudentVideoMirroring,
      Platform,
      CamOff,
      ClassStatus,
      DefaultMessage1,
      DefaultMessage2,
      JoinNow,
      LessonUnit,
      Lesson,
      Unit,
      Cancel,
      JoinSession,
      groupText,
      schoolName,
      campusName,
      className,
      groupName,
      isOpenMic,
      isOpenCam,
      playerRef,
      volumeByPercent,
      listMics,
      listCams,
      listCamsId,
      listMicsId,
      currentMic,
      currentCam,
      currentMicLabel,
      currentCamLabel,
      handleMicroChange,
      handleCameraChange,
      goToClass,
      isTeacher,
      isParent,
      currentUnit,
      currentLesson,
      handleUnitChange,
      handleLessonChange,
      listLessonByUnit,
      handleSubmit,
      handleCancel,
      videoElementId,
      agoraError,
      agoraCamError,
      agoraMicError,
      zoomMicError,
      zoomCamError,
      handleGoToClassSuccess,
      preventCloseModal,
      isUsingAgora,
      currentPlatform,
      listPlatform,
      isConfigTrackingDone,
      isTeacherVideoMirror,
      isStudentVideoMirror,
      isCheckSpeaker,
      listSpeakers,
      listSpeakersId,
      currentSpeaker,
      currentSpeakerLabel,
      CheckSpeaker,
      isPlayingSound,
      handleSpeakerChange,
      speakerIcon,
      toggleSpeaker,
      warningMsgSpeaker,
      unitInfo,
      loading,
      messageStartClass,
      classSetUpStudents,
      activeStudents,
      inActiveStudents,
      isTeacherSetup,
      isDisabledJoinBtn,
      dateTime,
    };
  },
});

import { ClassRoomStatus, SignalRStatus } from "@/models";
import * as audioSource from "@/utils/audioGenerator";
import { Logger } from "@/utils/logger";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Modal } from "ant-design-vue";
import { computed, ref, watch } from "vue";
import { fmtMsg, LoginInfo, RoleName } from "vue-glcommonui";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { LostNetwork } from "./../locales/localeid";
const fpPromise = FingerprintJS.load();

//five minutes
const STUDENT_LEAVE_ROOM_TIMING = 6000 * 10 * 5;

//three minutes
const TEACHER_LEAVE_ROOM_TIMING = 6000 * 10 * 3;

const RECONNECT_TIMING = 8000; //8 seconds

const RECONNECT_DELAY = 2000; //2 seconds

const TEACHER_PATH_REGEX = /\/teacher/;

export const useDisconnection = () => {
  const { getters, dispatch } = useStore();
  const studentDisconnected = computed<boolean>(() => getters["studentRoom/isDisconnected"]);
  const teacherDisconnected = computed<boolean>(() => getters["teacherRoom/isDisconnected"]);
  const signalRStatus = computed<number>(() => getters["signalRStatus"]);
  const currentClassRoomStatus = computed<number>(() => getters["classRoomStatus"]);
  const loginInfo = computed<LoginInfo>(() => getters["auth/getLoginInfo"]);
  const route = useRoute();
  let timeoutId: any;
  const router = useRouter();
  const messageText = computed(() => fmtMsg(LostNetwork.StudentMessage));
  const reconnectIntervalId = ref<any>();

  const teacherInitClass = async () => {
    const { classId } = route.params;
    const loginInfo: LoginInfo = getters["auth/getLoginInfo"];
    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;
    await dispatch("teacherRoom/initClassRoom", {
      classId,
      userId: loginInfo.profile.sub,
      userName: loginInfo.profile.name,
      role: RoleName.teacher,
      browserFingerPrinting: visitorId,
    });
  };

  const studentInitClass = async () => {
    const { studentId, classId } = route.params;
    if (!studentId || !classId) return;
    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;
    await dispatch("studentRoom/initClassRoom", {
      classId: classId,
      userId: loginInfo.value.profile.sub,
      userName: loginInfo.value.profile.name,
      studentId: studentId,
      role: RoleName.parent,
      browserFingerPrinting: visitorId,
    });
  };

  //handle teacher disconnection in teacher's side
  watch(teacherDisconnected, async (isDisconnected, prevIsDisconnected) => {
    const pathname = window.location.pathname;
    const matchIndex = pathname.search(TEACHER_PATH_REGEX);
    if (matchIndex < 0) {
      if (prevIsDisconnected !== isDisconnected && isDisconnected) {
        //handle case lost internet
        await dispatch("teacherRoom/leaveRoom", { leave: false });
        timeoutId = setTimeout(() => {
          audioSource.teacherTryReconnectSound.stop();
          audioSource.reconnectFailedSound.play();
          router.push("/teacher");
        }, TEACHER_LEAVE_ROOM_TIMING);
        audioSource.teacherTryReconnectSound.play();
        //TEACHER::handle case just signalR destroyed by any reason
        if (currentClassRoomStatus.value === ClassRoomStatus.InClass && signalRStatus.value === SignalRStatus.Closed) {
          //TEACHER::try re-init class after each 15 seconds

          reconnectIntervalId.value = setInterval(async () => {
            await teacherInitClass();
            await dispatch("teacherRoom/joinRoom", { reJoin: true });
          }, RECONNECT_TIMING);
          //TEACHER::try re-init class the first time when signalR destroyed
          await teacherInitClass();
          await dispatch("teacherRoom/joinRoom", { reJoin: true });
        }
        return;
      }
      if (prevIsDisconnected !== isDisconnected && !isDisconnected) {
        const { classId } = route.params;
        if (!classId) {
          window.location.reload();
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (reconnectIntervalId.value) {
          clearInterval(reconnectIntervalId.value);
        }
        audioSource.teacherTryReconnectSound.stop();
        audioSource.reconnectSuccessSound.play();
        await teacherInitClass();
        await dispatch("teacherRoom/joinRoom", { reJoin: true });
      }
    }
  });

  //handle student disconnection
  watch(studentDisconnected, async (isDisconnected, prevIssDisconnected) => {
    if (isDisconnected !== prevIssDisconnected && isDisconnected) {
      await dispatch("studentRoom/leaveRoom", { leave: false });
      timeoutId = setTimeout(async () => {
        audioSource.reconnectFailedSound.play();
        Modal.warning({
          content: messageText.value,
          onOk: () => {
            Logger.log("OK");
          },
        });
      }, STUDENT_LEAVE_ROOM_TIMING);
      //STUDENT::handle case just signalR destroyed by any reason
      if (currentClassRoomStatus.value === ClassRoomStatus.InClass && signalRStatus.value === SignalRStatus.Closed) {
        //STUDENT::try re-init class after each 15 seconds
        reconnectIntervalId.value = setInterval(async () => {
          await studentInitClass();
          await dispatch("studentRoom/joinRoom", { reJoined: true });
        }, RECONNECT_TIMING);
        //STUDENT::try re-init class the first time when signalR destroyed
        setTimeout(async () => {
          await studentInitClass();
          await dispatch("studentRoom/joinRoom", { reJoined: true });
        }, RECONNECT_DELAY);
      }
      return;
    }
    if (isDisconnected !== prevIssDisconnected && !isDisconnected) {
      clearTimeout(timeoutId);
      audioSource.reconnectSuccessSound.play();
      if (reconnectIntervalId.value) {
        clearInterval(reconnectIntervalId.value);
      }
      //STUDENT::prevent call initClassRoom second time in the case just signalR destroyed

      await studentInitClass();
      await dispatch("studentRoom/joinRoom", { reJoined: true });
    }
  });

  window.addEventListener("online", () => {
    const isTeacher: boolean = getters["auth/isTeacher"];
    const isParent: boolean = getters["auth/isParent"];
    if (isTeacher) {
      dispatch("teacherRoom/setOnline");
    }
    if (isParent) {
      dispatch("studentRoom/setOnline");
    }
  });
  window.addEventListener("offline", () => {
    const isTeacher: boolean = getters["auth/isTeacher"];
    const isParent: boolean = getters["auth/isParent"];
    if (isTeacher) {
      dispatch("teacherRoom/setOffline");
    }
    if (isParent) {
      dispatch("studentRoom/setOffline");
    }
  });

  watch(signalRStatus, async (currentSignalRStatus, prevSignalRStatus) => {
    const isTeacher: boolean = getters["auth/isTeacher"];
    const isParent: boolean = getters["auth/isParent"];
    switch (prevSignalRStatus !== currentSignalRStatus && currentSignalRStatus) {
      case SignalRStatus.Disconnected: {
        if (isTeacher) {
          dispatch("teacherRoom/setOffline");
        }
        if (isParent) {
          dispatch("studentRoom/setOffline");
        }
        break;
      }
      case SignalRStatus.Closed: {
        if (isTeacher) {
          dispatch("teacherRoom/setOffline");
        }
        if (isParent) {
          dispatch("studentRoom/setOffline");
        }
        break;
      }
      case SignalRStatus.NoStatus: {
        if (isTeacher) {
          dispatch("teacherRoom/setOnline");
          clearInterval(reconnectIntervalId.value);
          reconnectIntervalId.value = undefined;
        }
        if (isParent) {
          dispatch("studentRoom/setOnline");
          clearInterval(reconnectIntervalId.value);
          reconnectIntervalId.value = undefined;
        }
        break;
      }
    }
  });

  watch(route, (currentRoute) => {
    const classRoomStatus: number = getters["classRoomStatus"];
    if (!currentRoute.params.classId && classRoomStatus === ClassRoomStatus.InClass) {
      dispatch("setClassRoomStatus", { status: ClassRoomStatus.InDashBoard });
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (reconnectIntervalId.value) {
        clearInterval(reconnectIntervalId.value);
        reconnectIntervalId.value = undefined;
      }
    }
  });
};

import { LostNetwork } from "./../locales/localeid";
import { useStore } from "vuex";
import { fmtMsg, LoginInfo, RoleName } from "@/commonui";
import { Modal } from "ant-design-vue";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as audioSource from "@/utils/audioGenerator";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { SignalRStatus } from "@/models";
const fpPromise = FingerprintJS.load();

//five minutes
const POPUP_TIMING = 6000 * 10 * 5;

//three minutes
const TEACHER_RECONNECT_TIMING = 6000 * 10 * 3;
const TEACHER_PATH_REGEX = /\/teacher/;

export const useDisconnection = () => {
  const { getters, dispatch } = useStore();
  const studentDisconnected = computed<boolean>(() => getters["studentRoom/isDisconnected"]);
  const teacherDisconnected = computed<boolean>(() => getters["teacherRoom/isDisconnected"]);
  const signalRStatus = computed<number>(() => getters["signalRStatus"]);
  const loginInfo = computed<LoginInfo>(() => getters["auth/loginInfo"]);
  const route = useRoute();
  let timeoutId: any;
  const router = useRouter();
  const messageText = computed(() => fmtMsg(LostNetwork.StudentMessage));
  //handle teacher disconnection in teacher's side
  watch(teacherDisconnected, async (isDisconnected, prevIsDisconnected) => {
    const pathname = window.location.pathname;
    const matchIndex = pathname.search(TEACHER_PATH_REGEX);
    if (matchIndex < 0) {
      if (prevIsDisconnected !== isDisconnected && isDisconnected) {
        await dispatch("teacherRoom/leaveRoom");
        timeoutId = setTimeout(() => {
          audioSource.teacherTryReconnectSound.stop();
          audioSource.reconnectFailedSound.play();
          router.push("/teacher");
        }, TEACHER_RECONNECT_TIMING);
        audioSource.teacherTryReconnectSound.play();
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
        audioSource.teacherTryReconnectSound.stop();
        audioSource.reconnectSuccessSound.play();
        const loginInfo: LoginInfo = getters["auth/loginInfo"];
        const fp = await fpPromise;
        const result = await fp.get();
        const visitorId = result.visitorId;
        await dispatch("teacherRoom/initClassRoom", {
          classId: classId,
          userId: loginInfo.profile.sub,
          userName: loginInfo.profile.name,
          role: RoleName.teacher,
          browserFingerPrinting: visitorId,
        });
        await dispatch("teacherRoom/joinRoom");
      }
    }
  });

  //handle student disconnection

  watch(studentDisconnected, async (isDisconnected, prevIssDisconnected) => {
    if (isDisconnected !== prevIssDisconnected && isDisconnected) {
      await dispatch("studentRoom/leaveRoom");
      timeoutId = setTimeout(async () => {
        audioSource.reconnectFailedSound.play();
        Modal.warning({
          content: messageText.value,
          onOk: () => {
            console.log("OK");
          },
        });
      }, POPUP_TIMING);
      return;
    }
    if (isDisconnected !== prevIssDisconnected && !isDisconnected) {
      clearTimeout(timeoutId);
      audioSource.reconnectSuccessSound.play();
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
      await dispatch("studentRoom/joinRoom");
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

  watch(signalRStatus, currentSignalRStatus => {
    const isTeacher: boolean = getters["auth/isTeacher"];
    const isParent: boolean = getters["auth/isParent"];
    switch (currentSignalRStatus) {
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
        }
        if (isParent) {
          dispatch("studentRoom/setOnline");
        }
        break;
      }
    }
  });
};

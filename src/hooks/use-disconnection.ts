import { useStore } from "vuex";
import { LoginInfo, RoleName } from "@/commonui";
import { Modal } from "ant-design-vue";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as audioSource from "@/utils/audioGenerator";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
const fpPromise = FingerprintJS.load();

//five minutes
const POPUP_TIMING = 6000 * 10 * 5;

//three minutes
const TEACHER_RECONNECT_TIMING = 6000 * 10 * 3;

export const useDisconnection = () => {
  const { getters, dispatch } = useStore();
  const studentDisconnected = computed<boolean>(() => getters["studentRoom/isDisconnected"]);
  const myTeacherDisconnected = computed<boolean>(() => getters["studentRoom/teacherIsDisconnected"]);
  const teacherDisconnected = computed<boolean>(() => getters["teacherRoom/isDisconnected"]);
  const loginInfo = computed<LoginInfo>(() => getters["auth/loginInfo"]);
  const route = useRoute();

  let timeoutId: any;
  const router = useRouter();

  //handle teacher disconnection in student's side

  watch(myTeacherDisconnected, async isDisconnected => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (isDisconnected) {
      audioSource.reconnectFailedSound.play();
    }
  });

  //handle teacher disconnection in teacher's side
  let modalRef: any;
  watch(teacherDisconnected, async isDisconnected => {
    if (isDisconnected) {
      await dispatch("teacherRoom/leaveRoom");
      timeoutId = setTimeout(() => {
        audioSource.teacherTryReconnectSound.stop();
        audioSource.reconnectFailedSound.play();
        router.push("/teacher");
      }, TEACHER_RECONNECT_TIMING);
      audioSource.teacherTryReconnectSound.play();
      modalRef = Modal.warning({
        content: "So Sorry! It seems you lost network connectivity.",
        onOk: () => {
          console.log("OK");
        },
      });
      return;
    }
    modalRef.destroy();
    const { classId } = route.params;
    if (!classId) {
      window.location.reload();
      // const schools: ResourceModel[] =  getters["teacher/schools"]
      // dispatch("teacher/loadClasses", { schoolId: schools[0].id });
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
  });

  //handle student disconnection

  watch(studentDisconnected, async isDisconnected => {
    if (isDisconnected) {
      await dispatch("studentRoom/leaveRoom");
      timeoutId = setTimeout(async () => {
        audioSource.reconnectFailedSound.play();
        Modal.warning({
          content: "So Sorry! It seems you lost network connectivity.",
          onOk: () => {
            console.log("OK");
          },
        });
      }, POPUP_TIMING);
      return;
    }
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
};

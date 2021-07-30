import { StudentClassLocale } from "./../../locales/localeid";
import { ErrorCode, fmtMsg, LoginInfo, MatIcon, mobileDevice, RoleName } from "@/commonui";
import IconHand from "@/assets/student-class/hand-jb.png";
import IconHandRaised from "@/assets/student-class/hand-raised.png";
import UnityView from "@/components/common/unity-view/UnityView.vue";
import { useTimer } from "@/hooks/use-timer";
import { GLApiStatus, GLError, GLErrorCode } from "@/models/error.model";
import { ClassView, LessonInfo, StudentState, TeacherState } from "@/store/room/interface";
import * as audioSource from "@/utils/audioGenerator";
import { breakpointChange } from "@/utils/breackpoint";
import { Paths } from "@/utils/paths";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { computed, ComputedRef, defineComponent, reactive, ref, watch, onUnmounted, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import * as clockData from "../../assets/lotties/clock.json";
import { StudentAction } from "./components/student-action";
import { StudentGallery } from "./components/student-gallery";
import { StudentGalleryItem } from "./components/student-gallery-item";
import { StudentHeader } from "./components/student-header";
import { UnitPlayer } from "./components/unit-player";
import { RemoteTeachingService } from "@/services";
import JoinClassLoading from "../join-class-loading/join-class-loading.vue";
import PreventEscFirefox from "../prevent-esc-firefox/prevent-esc-firefox.vue";
import * as sandClock from "@/assets/lotties/sand-clock.json";
import { ClassRoomStatus } from "@/models";
import noAvatar from "@/assets/student-class/no-avatar.png";
import { formatImageUrl } from "@/utils/utils";
import { notification } from "ant-design-vue";

const fpPromise = FingerprintJS.load();

//temporary hard code video
const sourceVideo = {
  src: "https://devmediaservice-jpea.streaming.media.azure.net/8b604fd3-7a56-4a32-acc8-ad2227a47430/GSv4-U10-REP-Jonny Bear Paints w.ism/manifest",
  type: "application/vnd.ms-sstr+xml",
};

export default defineComponent({
  components: {
    JoinClassLoading,
    PreventEscFirefox,
    UnityView,
    MatIcon,
    StudentGallery,
    StudentGalleryItem,
    StudentHeader,
    UnitPlayer,
    StudentAction,
  },

  async created() {
    const { getters, dispatch } = useStore();
    const route = useRoute();
    const router = useRouter();
    const { studentId, classId } = route.params;
    const loginInfo: LoginInfo = getters["auth/loginInfo"];
    const classRoomState = computed(() => getters["classRoomStatus"]);

    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;
    try {
      if (classRoomState.value === ClassRoomStatus.InDashBoard) {
        await dispatch("setClassRoomStatus", { status: ClassRoomStatus.InClass });
      }
      await dispatch("studentRoom/initClassRoom", {
        classId: classId,
        userId: loginInfo.profile.sub,
        userName: loginInfo.profile.name,
        studentId: studentId,
        role: RoleName.parent,
        browserFingerPrinting: visitorId,
      });
    } catch (err) {
      if (err.code === ErrorCode.ConcurrentUserException) {
        await router.push(Paths.Parent);
      }
    }
    await dispatch("studentRoom/joinRoom");
    await dispatch("studentRoom/setIsJoined", { isJoined: true });
  },
  async beforeUnmount() {
    const store = useStore();
    await store.dispatch("studentRoom/leaveRoom");
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const joinLoading = ref(true);
    const exitText = computed(() => fmtMsg(StudentClassLocale.Exit));
    const goToHomePageText = computed(() => fmtMsg(StudentClassLocale.GoToHomePage));
    const student = computed<StudentState>(() => store.getters["studentRoom/student"]);
    const classInfo = computed<StudentState>(() => store.getters["studentRoom/classInfo"]);
    const lessonInfo = computed<LessonInfo>(() => store.getters["studentRoom/classInfo"]);
    const loginInfo: LoginInfo = store.getters["auth/loginInfo"];
    const teacher = computed<TeacherState>(() => store.getters["studentRoom/teacher"]);
    const students = computed(() => store.getters["studentRoom/students"]);
    const designateTargets = computed(() => store.getters["interactive/targets"]);
    const localTargets = computed(() => store.getters["interactive/localTargets"]);
    const isAssigned = computed(() => store.getters["interactive/isAssigned"]);
    const isLessonPlan = computed(() => store.getters["studentRoom/classView"] === ClassView.LESSON_PLAN);
    const apiStatus: ComputedRef<GLApiStatus> = computed(() => store.getters["studentRoom/apiStatus"]);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);
    const isStickerMode = computed(() => store.getters["annotation/isStickerMode"]);
    const isConnected = computed(() => store.getters["studentRoom/isConnected"]);
    const studentOneAndOneId = computed(() => store.getters["studentRoom/getStudentModeOneId"]);
    const handIcon = computed(() => (raisedHand.value ? IconHandRaised : IconHand));
    const contentSectionRef = ref<HTMLDivElement>();
    const videoContainerRef = ref<HTMLDivElement>();
    const studentIsDisconnected = computed<boolean>(() => store.getters["studentRoom/isDisconnected"]);
    const teacherIsDisconnected = computed<boolean>(() => store.getters["studentRoom/teacherIsDisconnected"]);
    const showBearConfused = computed<boolean>(() => {
      return store.getters["studentRoom/isDisconnected"] || store.getters["studentRoom/teacherIsDisconnected"];
    });
    const isOneToOne = ref(false);
    const studentIsOneToOne = ref(false);
    const breakpoint = breakpointChange();
    const avatarTeacher = computed(() => (teacher.value ? formatImageUrl(teacher.value.avatar ? teacher.value.avatar : "") : noAvatar));
    const getAvatarStudentOne = computed(() => store.getters["studentRoom/getAvatarStudentOneToOne"]);
    const avatarStudentOneToOne = ref("");
    const showMessage = ref(false);
    const studentOneName = ref("");

    const raisedHand = computed(() => (student.value?.raisingHand ? student.value?.raisingHand : false));

    const isBlackOutContent = computed(() => store.getters["lesson/isBlackOut"]);
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const previousExposureItemMedia = computed(() => store.getters["lesson/previousExposureItemMedia"]);
    const defaultUrl =
      "https://devmediaservice-jpea.streaming.media.azure.net/a8c883fd-f01c-4c5b-933b-dc45a48d72f7/GSv4-U15-REP-Jonny and Jenny Bea.ism/manifest";
    const iconSand = reactive({ animationData: sandClock.default });

    watch(lessonInfo, async () => {
      try {
        const response = await RemoteTeachingService.getLinkStoryDictionary(lessonInfo.value.unit, lessonInfo.value.lesson);
        if (response.url) {
          sourceVideo.src = response.url;
        } else {
          sourceVideo.src = defaultUrl;
        }
      } catch (error) {
        console.log(error);
      }
    });

    watch(getAvatarStudentOne, () => {
      avatarStudentOneToOne.value = getAvatarStudentOne.value ? formatImageUrl(getAvatarStudentOne.value) : noAvatar;
    });
    watch(teacher, async () => {
      if (!teacher.value) return;
      await store.dispatch("studentRoom/getAvatarTeacher", { teacherId: teacher.value.id });
    });
    watch(student, async () => {
      if (!student.value) return;
      await store.dispatch("studentRoom/setAvatarStudent", { studentId: student.value.id, oneToOne: false });
    });

    watch(students, async () => {
      if (!students.value) return;
      const studentIds = students.value.map((student: any) => {
        return student.id;
      });
      await store.dispatch("studentRoom/setAvatarAllStudent", { studentIds });
    });

    watch(studentOneAndOneId, async () => {
      if (studentOneAndOneId.value && studentOneAndOneId.value.length > 0) {
        studentOneName.value = students.value.find((student: StudentState) => student.id == studentOneAndOneId.value)?.name;
        await store.dispatch("studentRoom/setAvatarStudent", { studentId: studentOneAndOneId.value, oneToOne: true });
      }
      isOneToOne.value = !!studentOneAndOneId.value;
      if (student.value) {
        studentIsOneToOne.value = student.value.id === studentOneAndOneId.value;
        // if (!previousExposureItemMedia.value && student.value.id !== studentOneAndOneId.value) {
        //   await store.dispatch("lesson/setPreviousExposure", { id: currentExposure.value?.id });
        //   await store.dispatch("lesson/setPreviousExposureItemMedia", { id: currentExposureItemMedia.value?.id });
        // }
      } else {
        studentIsOneToOne.value = false;
      }
    });

    // Left section animation
    // const animate = () => {
    //   if (videoContainerRef.value) {
    //     const isOtherSectionVisible = [isLessonPlan.value].find(check => check);
    //     const timeline = gsap.timeline();
    //     if (isOtherSectionVisible) {
    //       const width = breakpoint.value < Breackpoint.Large ? 120 : 250;
    //       const height = breakpoint.value < Breackpoint.Large ? 100 : 160;
    //       timeline.to(videoContainerRef.value, { width, height });
    //     } else {
    //       timeline.to(videoContainerRef.value, { width: "100%", height: "100%" });
    //     }
    //   }
    // };

    // onMounted(animate);

    watch(studentOneAndOneId, () => {
      isOneToOne.value = !!studentOneAndOneId.value;
      if (student.value) {
        studentIsOneToOne.value = student.value.id === studentOneAndOneId.value;
      } else {
        studentIsOneToOne.value = false;
      }
    });

    watch(apiStatus, async () => {
      if (apiStatus.value) {
        if (apiStatus.value.code === GLErrorCode.CLASS_IS_NOT_ACTIVE) {
          showMessage.value = true;
          joinLoading.value = false;
        } else if (apiStatus.value.code === GLErrorCode.CLASS_HAS_BEEN_ENDED) {
          showMessage.value = true;
          joinLoading.value = false;
        } else if (apiStatus.value.code === GLErrorCode.PARENT_NOT_HAVE_THIS_STUDENT) {
          showMessage.value = true;
          joinLoading.value = false;
        } else if (apiStatus.value.code === GLErrorCode.SUCCESS || apiStatus.value.code === GLErrorCode.DISCONNECT) {
          joinLoading.value = false;
        }
      }
    });

    // watch(breakpoint, animate);

    // watch([isLessonPlan], animate);

    watch(isConnected, async () => {
      if (!isConnected.value) return;
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      try {
        await store.dispatch("studentRoom/joinWSRoom", { browserFingerPrinting: visitorId });
      } catch (err) {
        if (err.code === ErrorCode.ConcurrentUserException) {
          notification.error({
            message: err.message,
          });
        }
      }
    });

    const onClickLike = async () => {
      await store.dispatch("studentRoom/studentLike", {});
    };

    const onClickContentView = async (payload: { x: number; y: number; contentId: string }) => {
      await store.dispatch("studentRoom/studentAnswer", payload);
    };

    const disconnectSignalR = async () => {
      await store.dispatch("studentRoom/disconnectSignalR");
    };

    const isSecondPhase = ref(false);

    const myTeacherDisconnected = computed<boolean>(() => store.getters["studentRoom/teacherIsDisconnected"]);
    const { start, pause, stop, formattedTime, toSecond, formattedTimeFirstPhase } = useTimer();
    const milestonesSecond = {
      first: 150, // 00:02:30
      second: 0, // 00:00:00
      third: 30, //00:00:30
    };
    const isPlayVideo = ref(false);
    watch(formattedTime, async currentFormattedTime => {
      if (toSecond(currentFormattedTime) <= milestonesSecond.first) {
        audioSource.tryReconnectLoop2.stop();
      }
      if (toSecond(currentFormattedTime) === milestonesSecond.first) {
        audioSource.tryReconnectLoop2.stop();
        audioSource.watchStory.play();
        isSecondPhase.value = true;
        audioSource.watchStory.once("end", () => {
          isPlayVideo.value = true;
        });
      }
      if (toSecond(currentFormattedTime) < milestonesSecond.first && toSecond(currentFormattedTime) > milestonesSecond.second) {
        isPlayVideo.value = true;
        isSecondPhase.value = true;
      }
      if (toSecond(currentFormattedTime) === milestonesSecond.second) {
        pause();
        router.push("/disconnect-issue");
      }
    });
    const handleMyTeacherReconnect = () => {
      stop();
      audioSource.pleaseWaitTeacher.stop();
      audioSource.tryReconnectLoop2.stop();
      audioSource.watchStory.stop();
      isPlayVideo.value = false;
      isSecondPhase.value = false;
    };
    watch(myTeacherDisconnected, async (isDisconnected, prevIsDisconnected) => {
      if (prevIsDisconnected !== isDisconnected && !isDisconnected) {
        handleMyTeacherReconnect();
        return;
      }
      if (prevIsDisconnected !== isDisconnected && isDisconnected) {
        let initialTimeSecond = 0;
        const initialTimeMillis = store.getters["studentRoom/teacher"].disconnectTime;
        if (initialTimeMillis) {
          initialTimeSecond = Math.floor(initialTimeMillis / 1000);
        }
        start(initialTimeSecond);
        if (initialTimeSecond < milestonesSecond.third) {
          audioSource.pleaseWaitTeacher.play();
          audioSource.pleaseWaitTeacher.once("end", () => {
            audioSource.tryReconnectLoop2.play();
          });
        }
      }
    });
    const deviceMobile = () => {
      if (mobileDevice && router.currentRoute.value.name === "StudentClass") {
        document.body.classList.add("mobile-device");
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      } else {
        document.body.classList.remove("mobile-device");
      }
    };
    const goToHomePage = async () => {
      const currentNow = new Date().getTime() / 1000;
      if (currentNow > loginInfo.expires_at) {
        window.location.href = Paths.Parent;
      } else {
        await router.push(Paths.Parent);
      }
    };
    onMounted(() => {
      deviceMobile();
      window.addEventListener("resize", deviceMobile);
    });
    onUnmounted(() => {
      handleMyTeacherReconnect();
      window.addEventListener("resize", deviceMobile);
    });
    const option = reactive({ animationData: clockData.default });
    return {
      student,
      students,
      teacher,
      handIcon,
      isLessonPlan,
      isBlackOutContent,
      onClickLike,
      currentExposureItemMedia,
      previousExposureItemMedia,
      designateTargets,
      onClickContentView,
      isAssigned,
      localTargets,
      isPointerMode,
      isDrawMode,
      isStickerMode,
      studentOneAndOneId,
      studentIsOneToOne,
      isOneToOne,
      videoContainerRef,
      contentSectionRef,
      classInfo,
      raisedHand,
      disconnectSignalR,
      studentIsDisconnected,
      teacherIsDisconnected,
      showBearConfused,
      isSecondPhase,
      formattedTime,
      formattedTimeFirstPhase,
      option,
      sourceVideo,
      isPlayVideo,
      avatarTeacher,
      avatarStudentOneToOne,
      showMessage,
      apiStatus,
      exitText,
      goToHomePageText,
      iconSand,
      studentOneName,
      joinLoading,
      goToHomePage,
    };
  },
});

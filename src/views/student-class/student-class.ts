import {ErrorCode, LoginInfo, MatIcon, RoleName} from "@/commonui";
import { Howl, Howler } from "howler";
import UnityView from "@/components/common/unity-view/UnityView.vue";
import { TeacherModel } from "@/models";
import { GLError, GLErrorCode } from "@/models/error.model";
import { ClassView, StudentState } from "@/store/room/interface";
import gsap from "gsap";
import { computed, ComputedRef, defineComponent, onBeforeMount, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { StudentGallery } from "./components/student-gallery";
import IconAudioOn from "@/assets/student-class/audio-on.svg";
import IconAudioOff from "@/assets/student-class/audio-off.svg";
import IconVideoOn from "@/assets/student-class/video-on.svg";
import IconVideoOff from "@/assets/student-class/video-off.svg";
import IconHandRaised from "@/assets/student-class/hand-raised.png";
import IconHand from "@/assets/student-class/hand-jb.png";
import { Breackpoint, breakpointChange } from "@/utils/breackpoint";
import { Modal } from "ant-design-vue";
import { Paths } from "@/utils/paths";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
const fpPromise = FingerprintJS.load();

export default defineComponent({
  components: {
    UnityView,
    MatIcon,
    StudentGallery,
  },

  async created() {
    const { getters, dispatch } = useStore();
    const route = useRoute();
    const router = useRouter();
    const { studentId, classId } = route.params;
    const loginInfo: LoginInfo = getters["auth/loginInfo"];
    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;
    try {
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
    const student = computed<StudentState>(() => store.getters["studentRoom/student"]);
    const classInfo = computed<StudentState>(() => store.getters["studentRoom/classInfo"]);
    const loginInfo: LoginInfo = store.getters["auth/loginInfo"];
    const teacher = computed<TeacherModel>(() => store.getters["studentRoom/teacher"]);
    const students = computed(() => store.getters["studentRoom/students"]);
    const designateTargets = computed(() => store.getters["interactive/targets"]);
    const localTargets = computed(() => store.getters["interactive/localTargets"]);
    const isAssigned = computed(() => store.getters["interactive/isAssigned"]);
    const isLessonPlan = computed(() => store.getters["studentRoom/classView"] === ClassView.LESSON_PLAN);
    const errors: ComputedRef<GLError> = computed(() => store.getters["studentRoom/error"]);
    const isPointerMode = computed(() => store.getters["annotation/isPointerMode"]);
    const isDrawMode = computed(() => store.getters["annotation/isDrawMode"]);
    const isStickerMode = computed(() => store.getters["annotation/isStickerMode"]);
    const classAction = computed(() => store.getters["studentRoom/classAction"]);
    const isConnected = computed(() => store.getters["studentRoom/isConnected"]);
    const studentOneAndOneId = computed(() => store.getters["studentRoom/getStudentModeOneId"]);
    const audioIcon = computed(() => (student.value?.audioEnabled ? IconAudioOn : IconAudioOff));
    const videoIcon = computed(() => (student.value?.videoEnabled ? IconVideoOn : IconVideoOff));
    const handIcon = computed(() => (raisedHand.value ? IconHandRaised : IconHand));
    const contentSectionRef = ref<HTMLDivElement>();
    const videoContainerRef = ref<HTMLDivElement>();
    const studentIsDisconnected = computed<boolean>(() => store.getters["studentRoom/isDisconnected"]);

    const isOneToOne = ref(false);
    const studentIsOneToOne = ref(false);
    const breakpoint = breakpointChange();

    const raisedHand = computed(() => (student.value?.raisingHand ? student.value?.raisingHand : false));

    const classActionImageRef = ref<HTMLDivElement | null>(null);

    const isBlackOutContent = computed(() => store.getters["lesson/isBlackOut"]);
    const currentExposure = computed(() => store.getters["lesson/currentExposure"]);
    const currentExposureItemMedia = computed(() => store.getters["lesson/currentExposureItemMedia"]);
    const previousExposureItemMedia = computed(() => store.getters["lesson/previousExposureItemMedia"]);

    watch(studentOneAndOneId, async () => {
      isOneToOne.value = !!studentOneAndOneId.value;
      if (student.value) {
        studentIsOneToOne.value = student.value.id === studentOneAndOneId.value;
        if (!previousExposureItemMedia.value && student.value.id !== studentOneAndOneId.value) {
          await store.dispatch("lesson/setPreviousExposure", { id: currentExposure.value.id });
          await store.dispatch("lesson/setPreviousExposureItemMedia", { id: currentExposureItemMedia.value.id });
        }
      } else {
        studentIsOneToOne.value = false;
      }
    });

    // Left section animation
    const animate = () => {
      if (videoContainerRef.value) {
        const isOtherSectionVisible = [isLessonPlan.value].find(check => check);
        const timeline = gsap.timeline();
        if (isOtherSectionVisible) {
          const width = breakpoint.value < Breackpoint.Large ? 120 : 250;
          const height = breakpoint.value < Breackpoint.Large ? 100 : 160;
          timeline.to(videoContainerRef.value, { width, height });
        } else {
          timeline.to(videoContainerRef.value, { width: "100%", height: "100%" });
        }
      }
    };

    onMounted(animate);

    watch(studentOneAndOneId, () => {
      isOneToOne.value = !!studentOneAndOneId.value;
      if (student.value) {
        studentIsOneToOne.value = student.value.id === studentOneAndOneId.value;
      } else {
        studentIsOneToOne.value = false;
      }
    });

    watch(errors, () => {
      if (errors.value) {
        if (errors.value.errorCode === GLErrorCode.CLASS_IS_NOT_ACTIVE) {
          window.confirm(errors.value.message);
          router.replace("/");
        } else if (errors.value.errorCode === GLErrorCode.CLASS_HAS_BEEN_ENDED) {
          window.confirm(errors.value.message);
          router.replace("/");
        }
      }
    });

    watch(breakpoint, animate);

    watch([isLessonPlan], animate);

    watch(isConnected, async () => {
      if (!isConnected.value) return;
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorId = result.visitorId;
      await store.dispatch("studentRoom/joinWSRoom", { browserFingerPrinting: visitorId });
    });

    watch(classAction, () => {
      if (classActionImageRef.value) {
        const timeline = gsap.timeline();
        timeline.to(classActionImageRef.value, { scale: 2.5, transformOrigin: "top", zIndex: 99 });
        timeline.to(classActionImageRef.value, { delay: 3, scale: 1 });
      }
    });

    const toggleAudio = async () => {
      await store.dispatch("studentRoom/setStudentAudio", {
        id: student.value.id,
        enable: !student.value.audioEnabled,
      });
    };

    const toggleVideo = async () => {
      await store.dispatch("studentRoom/setStudentVideo", {
        id: student.value.id,
        enable: !student.value.videoEnabled,
      });
    };

    const onClickRaisingHand = async () => {
      await store.dispatch("studentRoom/studentRaisingHand", {});
    };
    const onClickLike = async () => {
      await store.dispatch("studentRoom/studentLike", {});
    };

    const onClickContentView = async (payload: { x: number; y: number; contentId: string }) => {
      await store.dispatch("studentRoom/studentAnswer", payload);
    };

    const onClickEnd = () => {
      Modal.confirm({
        title: "Are you sure you wish to leave the session?",
        okText: "Yes",
        cancelText: "No",
        okButtonProps: { type: "danger" },
        onOk: async () => {
          await store.dispatch("studentRoom/setIsJoined", { isJoined: false });
          await store.dispatch("studentRoom/studentLeaveClass");
          await router.push(Paths.Home);
        },
      });
    };

    const disconnectSignalR = async () => {
      await store.dispatch("studentRoom/disconnectSignalR");
    };

    return {
      student,
      students,
      teacher,
      audioIcon,
      videoIcon,
      handIcon,
      toggleAudio,
      toggleVideo,
      isLessonPlan,
      isBlackOutContent,
      onClickRaisingHand,
      onClickLike,
      classAction,
      classActionImageRef,
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
      onClickEnd,
      raisedHand,
      studentIsDisconnected,
      disconnectSignalR,
      IconHandRaised,
      IconHand,
      IconAudioOn,
      IconAudioOff,
      IconVideoOn,
      IconVideoOff,
    };
  },
});

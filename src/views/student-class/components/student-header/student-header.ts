import { StudentClassHeaderLocale } from "./../../../../locales/localeid";
import { ClassRoomModel, TeacherModel } from "@/models";
import { Paths } from "@/utils/paths";
import { Modal } from "ant-design-vue";
import { computed, defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import gsap from "gsap";
import { fmtMsg, MatIcon } from "@/commonui";

export default defineComponent({
  props: {},
  components: {
    MatIcon,
  },
  setup: () => {
    const store = useStore();
    const router = useRouter();
    const teacher = computed<TeacherModel>(() => store.getters["studentRoom/teacher"]);
    const classAction = computed(() => store.getters["studentRoom/classAction"]);
    const classInfo = computed<ClassRoomModel>(() => store.getters["studentRoom/classInfo"]);
    const classActionImageRef = ref<HTMLDivElement | null>(null);
    const exitText = computed(() => fmtMsg(StudentClassHeaderLocale.Exit));

    watch(classAction, () => {
      if (classActionImageRef.value) {
        const timeline = gsap.timeline();
        timeline.to(classActionImageRef.value, { scale: 2.5, transformOrigin: "top", zIndex: 9999999 });
        timeline.to(classActionImageRef.value, { delay: 3, scale: 1 });
      }
    });

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

    return {
      teacher,
      classAction,
      classInfo,
      onClickEnd,
      classActionImageRef,
      exitText,
    };
  },
});

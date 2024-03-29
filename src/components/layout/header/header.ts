import { DeviceTester, HelpMenu, ResourceMenu } from "@/components/common";
import NavMenu from "@/components/common/nav-menu/nav-menu.vue";
import { Layout, WriterReview } from "@/locales/localeid";
import { store } from "@/store";
import { computed, defineComponent, ref } from "vue";
import { AppHeader, BaseIcon, DrawerHelper, DropdownItem, fmtMsg, LanguagePicker, UserAvatar } from "vue-glcommonui";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  props: {
    title: String,
  },
  components: {
    AppHeader,
    LanguagePicker,
    UserAvatar,
    BaseIcon,
    DrawerHelper,
    DeviceTester,
    DropdownItem,
    ResourceMenu,
    HelpMenu,
    NavMenu,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const deviceTesterRef = ref<InstanceType<typeof DeviceTester>>();
    const testConnectText = computed(() => fmtMsg(Layout.TestConnect));
    const writerReviewText = computed(() => fmtMsg(WriterReview.Title));
    const currentSchoolId = computed(() => store.getters["teacher/currentSchoolId"]);
    const isShowWriterReview = computed(() => route.path.includes("teacher"));
    const onClickTestDevice = () => {
      deviceTesterRef.value?.showModal();
    };
    const onClickWriterReview = () => {
      if (isShowWriterReview.value) {
        router.push(`/teacher/image-view/${currentSchoolId.value}`);
      }
    };
    const isShowNavMenu = computed(() => {
      if (route.path.includes("teacher") || route.path.includes("teacher-calendars")) {
        return true;
      }
      return false;
    });
    return {
      onClickTestDevice,
      onClickWriterReview,
      deviceTesterRef,
      testConnectText,
      isShowWriterReview,
      writerReviewText,
      isShowNavMenu,
    };
  },
});

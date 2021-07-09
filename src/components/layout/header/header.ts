import { AuthService, fmtMsg, GLGlobal, LoginInfo } from "@/commonui";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import MenuItem from "./components/menu-item/menu-item.vue";
import { DeviceTester } from "@/components/common";
import { Layout } from "@/locales/localeid";
export default defineComponent({
  props: {
    title: String,
  },
  components: {
    MenuItem,
    DeviceTester,
  },
  setup() {
    const store = useStore();
    const isLoggedIn = computed(() => store.getters["auth/isLoggedIn"]);
    const userName = computed(() => store.getters["auth/username"]);
    const userRole = computed(() => store.getters["auth/userRole"]);
    const userAvatar = computed(() => store.getters["auth/userAvatar"]);
    const url = computed(() => process.env.VUE_APP_URL_AUTO_PORTAL);
    const showInfo = ref<boolean>(false);
    const deviceTesterRef = ref<InstanceType<typeof DeviceTester>>();
    const editProfileText = computed(() => fmtMsg(Layout.EditProfile));
    const testConnectText = computed(() => fmtMsg(Layout.TestConnect));
    const signOutText = computed(() => fmtMsg(Layout.SignOut));
    const onClickShowInfo = () => {
      showInfo.value = true;
    };
    const onClickHideInfo = () => {
      showInfo.value = false;
    };
    const onClickOpenAccountPage = () => {
      window.open(GLGlobal.authorityUrl());
    };
    const onClickSignOut = () => {
      AuthService.storePagethenSignoutRedirect();
    };
    const onClickTestDevice = () => {
      deviceTesterRef.value?.showModal();
    };
    return {
      isLoggedIn,
      userAvatar,
      userName,
      userRole,
      showInfo,
      onClickShowInfo,
      onClickHideInfo,
      onClickSignOut,
      onClickOpenAccountPage,
      onClickTestDevice,
      url,
      deviceTesterRef,
      editProfileText,
      testConnectText,
      signOutText,
    };
  },
});

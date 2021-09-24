import { AuthService, fmtMsg, GLGlobal, LoginInfo } from "@/commonui";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import MenuItem from "./components/menu-item/menu-item.vue";
import { DeviceTester } from "@/components/common";
import { Layout } from "@/locales/localeid";
import { Drawer } from "ant-design-vue";
import { DownOutlined, MoreOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  props: {
    title: String,
  },
  components: {
    MenuItem,
    DeviceTester,
    Drawer,
    DownOutlined,
    MoreOutlined,
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
    const showDrawer = ref(false);
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
    const onClickOpenDrawer = () => {
      showDrawer.value = true;
    };
    const onClickCloseDrawer = () => {
      showDrawer.value = false;
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
      showDrawer,
      onClickOpenDrawer,
      onClickCloseDrawer,
    };
  },
});

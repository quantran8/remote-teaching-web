import { AuthService, GLGlobal, LoginInfo } from "@/commonui";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import MenuItem from "./components/menu-item/menu-item.vue";
export default defineComponent({
  props: {
    title: String,
  },
  components: {
    MenuItem,
  },
  setup() {
    const store = useStore();
    const isLoggedIn = computed(() => store.getters["auth/isLoggedIn"]);
    const userName = computed(() => store.getters["auth/username"]);
    const userRole = computed(() => store.getters["auth/userRole"]);
    const userAvatar = computed(() => store.getters["auth/userAvatar"]);
    const showInfo = ref<boolean>(false);
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
      console.log("click");
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
    };
  },
});

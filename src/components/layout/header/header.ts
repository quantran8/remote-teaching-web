import { LoginInfo } from "@/commonui";
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
    const logginInfo: LoginInfo = store.getters["auth/loginInfo"];
    const userAvatar = computed(async () => {
      return logginInfo?.profile?.avatarUrl;
    });
    const showInfo = ref<boolean>(false);
    const onClickShowInfo = () => {
      showInfo.value = true;
    };
    const onClickHideInfo = () => {
      showInfo.value = false;
    };
    return {
      userAvatar,
      showInfo,
      onClickShowInfo,
      onClickHideInfo
    };
  },
});

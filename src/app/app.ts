import { AuthService } from "@/commonui";
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { MainLayout, AppHeader, AppFooter } from "../components/layout";
export default defineComponent({
  components: {
    MainLayout,
    AppHeader,
    AppFooter,
  },
  created() {
    AuthService.localSilentLogin();
  },

  setup() {
    const { getters } = useStore();
    const isHeaderVisible = computed(() => getters.isHeaderVisible);
    const isFooterVisible = computed(() => getters.isFooterVisible);
    const isSignedIn = computed(() => getters["auth/isLoggedIn"]);
    const loginInfo = computed(() => getters["auth/loginInfo"]);

    watch([isSignedIn], () => {
      console.log("SignIn changed", isSignedIn.value, loginInfo.value);
    });

    const refreshed = ref(0);
    const refresh = () => {
      refreshed.value += 1;
    };
    watch([refreshed], () => {
      console.log("refreshed", refreshed.value, isSignedIn);
    });

    return { refresh, isSignedIn, isHeaderVisible, isFooterVisible };
  },
});

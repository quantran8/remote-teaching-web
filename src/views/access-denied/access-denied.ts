import { AccessDeniedLocale } from "@/locales/localeid";
import { RoleName } from "vue-glcommonui";
import { fmtMsg } from "vue-glcommonui";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const { getters } = useStore();
    const nonTeacherWithPermission = computed(
      () => getters["auth/loginInfo"]?.profile?.roles.indexOf(RoleName.teacher) === -1 && getters["auth/loginInfo"].profile.remoteTsiSettings,
    );
    const accessDeniedWeAreSorry = computed(() => fmtMsg(AccessDeniedLocale.AccessDeniedWeAreSorry));
    const accessDeniedDescription = computed(() =>
      nonTeacherWithPermission.value
        ? fmtMsg(AccessDeniedLocale.AccessDeniedNonTeacherDescription)
        : fmtMsg(AccessDeniedLocale.AccessDeniedDescription),
    );
    const accessDeniedSuggest = computed(() => fmtMsg(AccessDeniedLocale.AccessDeniedSuggest));
    return {
      accessDeniedWeAreSorry,
      accessDeniedDescription,
      accessDeniedSuggest,
    };
  },
});

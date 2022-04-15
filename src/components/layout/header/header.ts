import { computed, defineComponent, ref } from "vue";
import { AppHeader, LanguagePicker, UserAvatar, BaseIcon, DrawerHelper, fmtMsg } from "vue-glcommonui";
import { DeviceTester } from "@/components/common";
import { Layout } from "@/locales/localeid";
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
  },
  setup() {
    const deviceTesterRef = ref<InstanceType<typeof DeviceTester>>();
    const testConnectText = computed(() => fmtMsg(Layout.TestConnect));
    const onClickTestDevice = () => {
      deviceTesterRef.value?.showModal();
    };
    return {
      onClickTestDevice,
      deviceTesterRef,
      testConnectText,
    };
  },
});

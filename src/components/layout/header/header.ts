import { computed, defineComponent, ref } from "vue";
import { AppHeader, LanguagePicker, UserAvatar, BaseIcon, DrawerHelper, fmtMsg, DropdownItem } from "vue-glcommonui";
import { DeviceTester, ResourceMenu , HelpMenu} from "@/components/common";
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
    DropdownItem,
    ResourceMenu,
	HelpMenu
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

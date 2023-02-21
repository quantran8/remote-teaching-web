import { HelperLocales } from "@/locales/localeid";
import { HelperService } from "@/services";
import { Logger } from "@/utils/logger";
import { notification } from "ant-design-vue";
import { computed, defineComponent } from "vue";
import { fmtMsg } from "vue-glcommonui";

export default defineComponent({
  props: {
    helperId: {
      type: String,
      required: true,
    },
    helperName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const notifyPart1Text = computed(() => fmtMsg(HelperLocales.NotifyPart1, { name: props.helperName }));
    const notifyPart2Text = computed(() => fmtMsg(HelperLocales.NotifyPart2));
    const notifyPart3Text = computed(() => fmtMsg(HelperLocales.NotifyPart3));
    const notifyPart4Text = computed(() => fmtMsg(HelperLocales.NotifyPart4));

    const onSubmit = async (status: "yes" | "no") => {
      const { helperId, helperName } = props;
      if (status === "yes") {
        try {
          await HelperService.teacherAcceptHelper(helperId, helperName);
          // close all the notification
          notification.destroy();
        } catch (error) {
          Logger.error(error);
        }
        return;
      }
      try {
        await HelperService.teacherDenyHelper(helperId);
        // just close this helper's notification
        notification.close(helperId);
      } catch (error) {
        Logger.error(error);
      }
    };
    return { onSubmit, notifyPart1Text, notifyPart2Text, notifyPart3Text, notifyPart4Text };
  },
});

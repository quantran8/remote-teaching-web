import { computed, defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import { Notification } from "@/store/notification/state";

interface NotificationItem extends Notification {
  style: string;
}
export default defineComponent({
  setup() {
    const { getters, dispatch } = useStore();
    const notification = computed(() => getters["notification/notification"]);
    const notifications: Ref<NotificationItem[]> = ref([]);
    const removeNotification = (id: string) => {
      const index = notifications.value.findIndex((e) => e.id === id);
      if (index !== -1) notifications.value.splice(index, 1);
    };

    const onNotificationChanged = async () => {
      if (notification.value) {
        const id = notification.value.id;
        const noti = {
          ...notification.value,
          style: ``,
        };
        notifications.value.push(noti);
        setTimeout(() => removeNotification(id), notification.value.duration);
        await dispatch("notification/removeNotification", { id: id });
      }
    };

    watch(notification, onNotificationChanged);

    const onClickRemoveNotification = (noti: NotificationItem) => {
      removeNotification(noti.id);
    };
    return { notifications, onClickRemoveNotification };
  },
});

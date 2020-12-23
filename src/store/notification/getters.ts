import { GetterTree } from "vuex";
import { NotificationState, Notification } from "./state";

const getters: GetterTree<NotificationState, any> = {
  notification(state: NotificationState): Notification | null {
    if (state.notifications.length === 0) return null;
    return state.notifications[0];
  },
};

export default getters;

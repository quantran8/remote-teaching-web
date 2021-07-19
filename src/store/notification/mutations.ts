import { MutationTree } from "vuex";
import { NotificationState, Notification } from "./state";

const mutations: MutationTree<NotificationState> = {
  addNotification(state: NotificationState, payload: Notification) {
    state.notifications.push(payload);
  },
  removeNotification(state: NotificationState, payload: { id: string }) {
    const index = state.notifications.findIndex((n) => n.id === payload.id);
    if (index !== -1) state.notifications.splice(index, 1);
  },
  removeAllNotification(state: NotificationState, payload: Notification) {
    state.notifications = [];
  },
};

export default mutations;

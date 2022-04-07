import { ActionTree } from "vuex";
import { NotificationState, Notification } from "./state";

const actions: ActionTree<NotificationState, any> = {
  addNotification(store, payload: Notification) {
    store.commit("addNotification", payload);
  },
  removeNotification(
    store,
    payload: {
      id: string;
    },
  ) {
    store.commit("removeNotification", payload);
  },
  removeAllNotification(store, payload: {}) {
    store.commit("removeAllNotification", payload);
  },
};

export default actions;

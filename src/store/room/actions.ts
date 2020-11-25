import { RoomOptions } from "@/manager/room.manager";
import { Parent } from "@/models/parent.model";
import { RemoteTeachingService } from "@/services";
import { ActionTree } from "vuex";
import { RoomState } from "./state";

const actions: ActionTree<RoomState, any> = {
  initRoom({ commit }, payload: RoomOptions) {
    commit("initRoom", payload);
  },

  setInfo({ commit }, payload: Parent) {
    commit("setInfo", payload);
  },

  async loadRooms(store, payload: any) {
    RemoteTeachingService.getAvailableRooms().then((res) => {
      console.log("getAvailableRooms", res);
    });
  },
};

export default actions;

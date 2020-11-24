import { Parent } from "@/models/parent.model";
import { RemoteTeachingService } from '@/services';
import { ActionTree } from "vuex";
import { RoomState } from "./state";

const actions: ActionTree<RoomState, any> = {
  setInfo({ commit }, payload: Parent) {
    commit("setInfo", payload);
  },
  async loadRooms(store, payload: any) {
    console.log("loadRooms", store, payload);
    RemoteTeachingService.getAvailableRooms().then(res =>{
      console.log("getAvailableRooms", res);
    })
  },
};

export default actions;

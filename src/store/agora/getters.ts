import { GetterTree } from "vuex";
import { AgoraState } from "./state";

const getters: GetterTree<AgoraState, any> = {
  usersJoined(state: AgoraState): string[] {
    return state.usersJoined;
  },
  rejoinClass(state: AgoraState): boolean {
    return state.rejoinClass;
  },
};

export default getters;

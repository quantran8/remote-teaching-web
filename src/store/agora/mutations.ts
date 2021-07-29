import { AgoraState } from "./state";
import { MutationTree } from "vuex";

const mutations: MutationTree<AgoraState> = {
  addUser(state, payload: string) {
    const idx = state.usersJoined.findIndex(id => id === payload);
    if (idx > -1) return;
    state.usersJoined.push(payload);
  },
  removeUser(state, payload: string) {
    const idx = state.usersJoined.findIndex(id => id === payload);
    state.usersJoined.splice(idx, 1);
  },
  toggleRejoinClass(state) {
    state.rejoinClass = !state.rejoinClass;
  },
};

export default mutations;

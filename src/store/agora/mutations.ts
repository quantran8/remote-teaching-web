import { AgoraState } from "./state";
import { MutationTree } from "vuex";

const mutations: MutationTree<AgoraState> = {
  addUser(state, payload: string) {
    state.usersJoined.push(payload);
	console.log('state.usersJoined', state.usersJoined);
  },
  removeUser(state, payload: string) {
    const idx = state.usersJoined.findIndex(id => id === payload);
    state.usersJoined.splice(idx, 1);
  },
};

export default mutations;

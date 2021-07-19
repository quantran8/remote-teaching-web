import { LoginInfo } from "@/commonui";
import { MutationTree } from "vuex";
import { AuthState } from "./state";

const mutations: MutationTree<AuthState> = {
  setLoginInfo(state: AuthState, payload: LoginInfo) {
    state.loginInfo = payload;
  },
};

export default mutations;

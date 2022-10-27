import { LoginInfo } from "vue-glcommonui";
import { ActionTree } from "vuex";
import { AuthState } from "./state";

const actions: ActionTree<AuthState, any> = {
  signin(store, payload: { loginInfo: LoginInfo }) {
    store.commit("setLoginInfo", payload.loginInfo);
  },
  signout(store, _) {
    // store.commit("setLoginInfo", null);
  },
};

export default actions;

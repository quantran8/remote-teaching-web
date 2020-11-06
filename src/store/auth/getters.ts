import { GLGlobal, LoginInfo } from "@/commonui";
import { GetterTree } from "vuex";
import { AuthState } from "./state";

const getters: GetterTree<AuthState, any> = {
  isLoggedIn: (state: AuthState): boolean => {
    return state.loginInfo?.loggedin || false;
  },
  loginInfo: (state: AuthState): LoginInfo => {
    return state.loginInfo || ({} as LoginInfo);
  },
  username: (state: AuthState): string => {
    return state.loginInfo?.profile.name || "";
  },
};

export default getters;

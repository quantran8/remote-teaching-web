import { LoginInfo } from "vue-glcommonui";

export interface AuthState {
  loginInfo: LoginInfo | null;
}

const state: AuthState = {
  loginInfo: null,
};

export default state;

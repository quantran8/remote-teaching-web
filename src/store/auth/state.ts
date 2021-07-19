import { LoginInfo } from "@/commonui";

export interface AuthState {
  loginInfo: LoginInfo | null;
}

const state: AuthState = {
  loginInfo: null,
};

export default state;

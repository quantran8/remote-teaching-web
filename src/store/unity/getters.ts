import { GetterTree } from "vuex";
import { UnityState } from "./state";

const getters: GetterTree<UnityState, any> = {
  message(state: UnityState): string{
    console.log('345645646:', state);
    return state.message;
  }
};

export default getters;

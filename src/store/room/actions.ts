import { RoomOptions } from "@/manager/room.manager";
import { RoomModel } from "@/models";
import { StudentModel } from "@/models";
import { TeacherModel } from "@/models";
import { UserModel } from "@/models/user.model";
import {
  GetClassesModel,
  RemoteTeachingService,
  TeacherGetRoomResponse,
  TeacherService,
} from "@/services";
import { ActionTree } from "vuex";
import { RoomState } from "./state";

const actions: ActionTree<RoomState, any> = {
  initRoom({ commit }, payload: RoomOptions) {
    commit("initRoom", payload);
  },
  setCurrentUser({ commit }, payload: UserModel) {
    commit("setCurrentUser", payload);
  },
  setTeacher({ commit }, payload: TeacherModel) {
    commit("setTeacher", payload);
  },
  setStudents({ commit }, payload: Array<StudentModel>) {
    commit("setStudents", payload);
  },
  setRoomInfo({ commit }, payload: RoomModel) {
    commit("setRoomInfo", payload);
  },
  async loadRooms({ commit }, _payload: any) {
    const roomResponse: TeacherGetRoomResponse = await RemoteTeachingService.getActiveClassRoom();
    if (!roomResponse) return;
    commit("setRoomInfo", roomResponse.data);
  },
  async loadClasses({ commit }, { teacherId }: { teacherId: string }) {
    const response: GetClassesModel = await TeacherService.getClasses(
      teacherId
    );
    if (!response) return;
    commit("setClasses", response.data);
  },
};

export default actions;

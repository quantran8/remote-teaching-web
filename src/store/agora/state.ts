import {} from "@/models";

export interface AgoraState {
  usersJoined: string[];
}

const state: AgoraState = {
  usersJoined: [],
};

export default state;

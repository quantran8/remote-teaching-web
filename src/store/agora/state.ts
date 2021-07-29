import {} from "@/models";

export interface AgoraState {
  usersJoined: string[];
  rejoinClass: boolean;
}

const state: AgoraState = {
  usersJoined: [],
  rejoinClass: false,
};

export default state;

import { RoomManager } from "@/manager/room.manager";
import { defineComponent } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  created() {
    console.log("Component created");
  },

  setup() {
    const store = useStore();
    const roomManager = store.getters["room/roomManager"] as RoomManager;
    const joinZoom = () => {
      console.log("Join Zooom", roomManager.options);
      // RTRoomManager.agoraClient.initClient();
      // AgoraClientSDK.initClient();
      roomManager.agoraClient.initClient();
    };
    const startStream = () => {
      console.log("Start Stream");
      roomManager.agoraClient.initStream();
      // AgoraClientSDK.initStream();
      // console.log(AgoraClientSDK.stream);
      // RTRoomManager.agoraClient.initStream();
    };

    const getDevices = () => {
      console.log("getDevices");
    };
    const getCameras = () => {
      console.log("getCameras");
    };
    return {
      joinZoom,
      startStream,
      getDevices,
      getCameras,
    };
  },
});

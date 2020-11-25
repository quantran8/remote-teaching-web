import { RoomManager } from "@/manager/room.manager";
import { defineComponent } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore();
    const roomManager = store.getters["room/roomManager"] as RoomManager;
    const joinZoom = () => {
      console.log("Join Zooom", roomManager.options);
      roomManager.agoraClient.initClient();
    };
    const startStream = () => {
      console.log("Start Stream");
      roomManager.agoraClient.initStream();
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

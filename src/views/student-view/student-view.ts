import { defineComponent } from "vue";
import { AgoraClientSDK } from "@/agora";
import { RTRoomManager } from "@/manager/room.manager";
export default defineComponent({
  created() {
    console.log("Component created");
  },

  setup() {
    const joinZoom = () => {
      console.log("Join Zooom");
      RTRoomManager.agoraClient.initClient();
      // AgoraClientSDK.initClient();
    };
    const startStream = () => {
      console.log("Start Stream");
      // AgoraClientSDK.initStream();
      // console.log(AgoraClientSDK.stream);
      RTRoomManager.agoraClient.initStream();
    };

    const getDevices = () => {
      // AgoraClientSDK.getDevices();
      RTRoomManager.agoraClient.getDevices();
    };
    const getCameras = () => {
      // AgoraClientSDK.getCameras();
      RTRoomManager.agoraClient.getCameras();
    };
    return {
      joinZoom,
      startStream,
      getDevices,
      getCameras,
    };
  },
});

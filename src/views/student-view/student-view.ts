import { defineComponent } from "vue";
import { AgoraClientSDK } from "@/agora";
export default defineComponent({
  created() {
    console.log("Component created");
  },

  setup() {
    const joinZoom = () => {
      console.log("Join Zooom");
      AgoraClientSDK.initClient();
    };
    const startStream = () => {
      console.log("Start Stream");
      AgoraClientSDK.initStream();
      console.log(AgoraClientSDK.stream);
    };
    return {
      joinZoom,
      startStream
    };
  },
});

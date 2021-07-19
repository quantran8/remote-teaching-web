import DeviceDetector from "device-detector-js";
import { defineComponent, onMounted, onUnmounted } from "vue";

export default defineComponent({
  setup() {
    const handleKeyDown = (e: any) => {
      const deviceDetector = new DeviceDetector();
      const device = deviceDetector.parse(navigator.userAgent);
      if (e.which == 27 && device?.client?.name == "Firefox") {
        e.preventDefault();
      }
    };
    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });
    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  },
});

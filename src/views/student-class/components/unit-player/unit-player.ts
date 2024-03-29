import { Logger } from "@/utils/logger";
import { ref, defineComponent, onUnmounted } from "vue";
import { technologyType } from "./interfaces";

const AMP_LOAD_TIMEOUT = 300;

export default defineComponent({
  props: {
    sourceVideo: {
      type: Object,
      required: true,
    },
  },
  setup: (props) => {
    const videoRef = ref(null);
    let videoPlayer: any;
    const createVideoPlayer = (amp: any) => {
      const video = amp(videoRef.value, {
        nativeControlsForTouch: false,
        autoplay: true,
        controls: true,
        loop: true,
        muted: false,
        logo: { enabled: false },
        techOrder: [
          technologyType.azureHtml5JS,
          technologyType.flashSS,
          technologyType.html5FairPlayHLS,
          technologyType.silverlightSS,
          technologyType.html5,
        ],
      });
      video.addEventListener(amp.eventName.error, (payload: any) => {
        Logger.log("Error details =>", payload);
      });
      video.addEventListener(amp.eventName.ended, (payload: any) => {
        Logger.log("Ended details =>", payload);
      });
      return video;
    };

    const waitForAmp = () => {
      return new Promise((resolve, reject) => {
        let waited = 0;
        const wait = (interval: number) => {
          setTimeout(() => {
            waited += interval;
            const amp = window["amp"];
            if (amp !== undefined) {
              return resolve(amp);
            }
            if (waited >= AMP_LOAD_TIMEOUT * 100) {
              return reject();
            }
            wait(interval * 2);
            return null;
          }, interval);
        };
        wait(30);
      });
    };

    waitForAmp()
      .then((amp) => {
        videoPlayer = createVideoPlayer(amp);
        videoPlayer.src([props.sourceVideo]);
        videoPlayer.autoplay();
      })
      .catch((e) => Logger.error("Could not found Azure Media Player plugin", e));

    onUnmounted(() => {
      videoPlayer.dispose();
    });

    return {
      videoRef,
    };
  },
});

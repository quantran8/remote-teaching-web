import { defineComponent } from "@vue/runtime-core";
import { ref } from "vue";

const ampLoadTimeout = 300;

export enum technologyType {
  azureHtml5JS = "azureHtml5JS",
  flashSS = "flashSS",
  html5FairPlayHLS = "html5FairPlayHLS",
  silverlightSS = "silverlightSS",
  html5 = "html5",
}

const sourceVideo = {
  src: "//amssamples.streaming.mediaservices.windows.net/622b189f-ec39-43f2-93a2-201ac4e31ce1/BigBuckBunny.ism/manifest",
  type: "application/vnd.ms-sstr+xml",
};

export default defineComponent({
  setup: props => {
    const videoRef = ref(null);
    let videoPlayer: any;
    const createVideoPlayer = (amp: any) => {
      const video = amp(videoRef.value, {
        nativeControlsForTouch: false,
        autoplay: true,
        controls: true,
        logo: { enabled: false },
        techOrder: ["azureHtml5JS", "html5FairPlayHLS", "html5"],
      });
      video.addEventListener(amp.eventName.error, (errorDetails: any) => {
        console.log("errorDetails", errorDetails);
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
            if (waited >= ampLoadTimeout * 100) {
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
      .then(amp => {
        videoPlayer = createVideoPlayer(amp);
        videoPlayer.src([sourceVideo]);
      })
      .catch(e => console.error("Could not found Azure Media Player plugin", e));
    return {
      videoRef,
    };
  },
});

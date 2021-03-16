import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

export interface UnityLoaderInterface {
  instantiate(
    container: string,
    jsonPath: string,
    options: { onProgress: (instance: any, progress: number) => void }
  ): UnityInstanceInterface;
}

export interface UnityInstanceInterface {
  SendMessage(connection: string, command: string, message: string): void;
}

export default defineComponent({
  props: {
    src: {
      type: String,
      required: true
    },
    json: {
      type: String,
      required: true
    },
    messageText: {
      type: String,
      required: true,
      default: ""
    }
  },
  emits: ["on-loader-loaded", "on-progress", "on-loaded"],
  setup(props, { emit }) {
    const store = useStore();
    const containerId = `unity-wrapper-${Date.now()}`;
    const unityLoader = ref<UnityLoaderInterface | null>(null);
    const unityInstance = ref<UnityInstanceInterface | null>(null);

    const receivedMessage = computed(
      () => store.getters["unity/message"]
    );
      
    const sendMessageToUnity = (command: string, message: string) => {
      if (unityInstance.value === null) return;
      console.log("sendMessageToUnity", command, message);
      unityInstance.value.SendMessage("[Bridge]", command, message);
    };
    watch(receivedMessage, () => {
      sendMessageToUnity("ReceiveMessageFromPage", receivedMessage.value);
    })
    const receiveMessageFromUnity = async (message: string) => {
      console.log("receiveMessageFromUnity", message);
      if (props.messageText == "Teacher"){
        await store.dispatch("teacherRoom/sendUnity", {
          message: message
        });
      }
    };
    const _sendTestMessage = () => {
      setTimeout(() => {
        sendMessageToUnity("ReceiveMessageFromPage", props.messageText);
      }, 3000);
    };
    const _onLoaded = () => {
      emit("on-loaded");
      _sendTestMessage();
    };
    const _onProgress = (_: any, progress: number) => {
      emit("on-progress", progress);
      if (progress === 1) _onLoaded();
    };
    const initBridge = () => {
      (window as any)["receiveMessageFromUnity"] = receiveMessageFromUnity;
    };
    const init = () => {
      if (!unityLoader.value) return;
      initBridge();
      unityInstance.value = unityLoader.value.instantiate(
        containerId,
        props.json,
        {
          onProgress: _onProgress,
        }
      );
    };

    const _onLoadedUnityLoader = () => {
      unityLoader.value = UnityLoader;
      emit("on-loader-loaded");
      init();
    };
    const importUnityLoader = () => {
      const script = document.createElement("SCRIPT");
      script.setAttribute("src", props.src);
      script.setAttribute("async", "");
      script.setAttribute("defer", "");
      document.body.appendChild(script);
      script.onload = _onLoadedUnityLoader;
    };

    onMounted(() => {
      importUnityLoader();
    });

    return {
      importUnityLoader,
      init,
      unityLoader,
      containerId,
    };
  },
});

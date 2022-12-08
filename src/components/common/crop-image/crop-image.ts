import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { computed, defineComponent, onBeforeMount, onMounted, onUnmounted, onUpdated, ref, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: ["imageUrl", "metadata", "canvasImage"],
  emits: ["img-load"],
  setup(props, { emit }) {
    const { getters, dispatch } = useStore();

    const findCachedImage = getters["lesson/findCachedImage"];

    const imageRef = ref<HTMLImageElement>();
    const croppedImageUrlRef = ref<string | undefined>();

    const isProcessing = ref<boolean>(false);
    const cacheImage = ref<string>("");

    const currentCropData = computed(() => {
      return {
        url: props.imageUrl ? props.imageUrl : {},
        metadata: props.metadata,
      };
    });

    const imgUrl = computed(() => {
      if (croppedImageUrlRef.value) {
        return croppedImageUrlRef.value;
      }
      return props.imageUrl ? props.imageUrl : {};
    });

    const onImageLoad = (e: Event) => {
      if (cacheImage.value && props.canvasImage) {
        dispatch("annotation/setImgProcessing", false);
      }
      emit("img-load", e);
    };

    const processImg = (withCropData: { url: any; metadata: any }) => {
      const { url, metadata } = withCropData;
      if (props.canvasImage) {
        dispatch("annotation/setImgProcessing", true);
      }

      // checking if exist in cache
      cacheImage.value = findCachedImage({ url, metadata });
      if (cacheImage.value) {
        complete(cacheImage.value);
        return;
      }
      if (!imageRef.value) return;
      const cropper = new Cropper(imageRef.value, {
        autoCrop: false,
        crop(event) {
          if (event.detail.width === metadata.width || event.detail.height === metadata.height) {
            const base64String = cropper.getCroppedCanvas().toDataURL("image/png");
            cropper.destroy();

            dispatch("lesson/storeCacheImage", { url, metadata, base64String });

            // update the image only when matched between processing cropdata and current cropdata
            if (JSON.stringify(withCropData) === JSON.stringify(currentCropData.value)) {
              complete(base64String);
            }
          }
        },
        ready() {
          cropper.crop();
          cropper.setData(metadata);
        },
        dragMode: "none",
        zoomable: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
      });
    };

    const prepare = () => {
      // hide the uncropped image
      isProcessing.value = true;
      // reset cropped image
      croppedImageUrlRef.value = undefined;
    };

    const complete = (base64String: string) => {
      if (props.canvasImage) {
        dispatch("annotation/setImgProcessing", false);
      }
      // assign cropped base64 string as image
      croppedImageUrlRef.value = base64String;
      // complete cropping, then show the cropped image
      isProcessing.value = false;
    };

    onBeforeMount(() => {
      prepare();
    });

    onMounted(() => {
      // first time cropping image
      processImg({ ...currentCropData.value });
    });

    onUnmounted(() => {
      croppedImageUrlRef.value = undefined;
    });

    watch(currentCropData, () => {
      // perform cropping again when crop data changed
      prepare();
    });

    onUpdated(() => {
      processImg({ ...currentCropData.value });
    });

    return { imgUrl, imageRef, isProcessing, onImageLoad };
  },
});

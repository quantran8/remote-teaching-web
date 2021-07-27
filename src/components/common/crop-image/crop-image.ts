import { computed, defineComponent, onBeforeMount, onMounted, onUpdated, ref, watch } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

export default defineComponent({
  props: ["imageUrl", "metadata"],
  emits: ["img-load"],
  setup(props, { emit }) {
    const imageRef = ref<HTMLImageElement>();
    const croppedImageUrlRef = ref<string | undefined>();

    const isProcessing = ref<boolean>(false);

    const cropData = computed(() => {
      return {
        imageUrl: props.imageUrl ? props.imageUrl : {},
        metadata: props.metadata,
      };
    });

    const imgUrl = computed(() => {
      if (croppedImageUrlRef.value) {
        return croppedImageUrlRef.value;
      }
      return props.imageUrl ? props.imageUrl : {};
    });

    const onImageLoad = () => {
      emit("img-load");
    };

    const processImg = () => {
      const metadata = props.metadata;
      const cropper = new Cropper(imageRef.value!, {
        autoCrop: false,
        crop(event) {
          if (event.detail.width === metadata.width || event.detail.height === metadata.height) {
            croppedImageUrlRef.value = cropper.getCroppedCanvas().toDataURL("image/png");
            cropper.destroy();

            // complete cropping, then show the cropped image
            isProcessing.value = false;
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

    const prepareCrop = () => {
      // hide the uncropped image
      isProcessing.value = true;
      // reset cropped image
      croppedImageUrlRef.value = undefined;
    };

    onBeforeMount(() => {
      prepareCrop();
    });

    onMounted(() => {
      // first time cropping image
      processImg();
    });

    watch(cropData, () => {
      // perform cropping again when crop data changed
      prepareCrop();
    });

    onUpdated(() => {
      // already crop image onMount, then skip. this block will work for next update cropData
      if (isProcessing.value) {
        processImg();
      }
    });

    return { imgUrl, imageRef, isProcessing, onImageLoad };
  },
});

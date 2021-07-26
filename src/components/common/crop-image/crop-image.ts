import { computed, defineComponent, onBeforeMount, onMounted, ref } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

export default defineComponent({
  props: ["imageUrl", "metadata"],
  emits: ["imgLoad"],
  setup(props, { emit }) {
    const imageRef = ref<HTMLImageElement>();
    const croppedImageUrlRef = ref<string | undefined>();

    const isProcessing = ref<boolean>(false);

    const imgUrl = computed(() => {
      if (croppedImageUrlRef.value) {
        return croppedImageUrlRef.value;
      }
      return props.imageUrl ? props.imageUrl : {};
    });

    const onImageLoad = () => {
      emit("imgLoad");
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

    onBeforeMount(() => {
      // hide the uncropped image
      isProcessing.value = true;
    });

    onMounted(() => {
      processImg();
    });

    return { imgUrl, imageRef, isProcessing, onImageLoad };
  },
});

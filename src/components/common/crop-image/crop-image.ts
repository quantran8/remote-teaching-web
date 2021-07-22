import {defineComponent, onMounted, onUnmounted, ref} from "vue";
import Cropper from "cropperjs";

export default defineComponent({
  props: ["imageUrl", "metadata"],
  setup(props) {
    const imgUrl = ref("");
    const imgCrop = ref<any>(null);
    let cropper: any;
    const processImg = () => {
      if (Object.keys(props.metadata).length !== 0) {
        // process image with metadata
        imgUrl.value = props.imageUrl;
        if (!imgCrop.value) return;
        cropper = new Cropper(imgCrop.value, {
          aspectRatio: 1,
          autoCrop: false,
          background: false,
          ready: () => {
            console.log("test");
          },
        });
        cropper.setCropBoxData(props.metadata);
        // const imgUrlCrop = cropper.getCroppedCanvas().toDataURL();
        // console.log(cropper.getCroppedCanvas(props.metadata).toDataURL());
        console.log(cropper, "cccccccccccc");
      } else {
        imgUrl.value = props.imageUrl;
      }
    };
    onMounted(() => {
      processImg();
    });
    onUnmounted(() => {
      cropper.destroy();
    });
    return { imgUrl, imgCrop };
  },
});

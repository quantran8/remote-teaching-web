import {
  AGORA_APP_CERTIFICATE,
  AGORA_APP_ID,
  AGORA_APP_TOKEN,
} from "@/agora/config";
import { RoomModel } from "@/models";
import { computed, defineComponent, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassCard from "./components/class-card/class-card.vue";
export default defineComponent({
  components: {
    ClassCard,
  },
  created() {
    const store = useStore();
    store.dispatch("room/loadRooms");
    // store.dispatch("room/loadClasses");
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const classes = computed(() => store.getters["room/classes"]);
    const username = computed(() => store.getters["auth/username"]);
    const roomInfo = computed(() => store.getters["room/info"]);
    watch(roomInfo, () => {
      const room: RoomModel = roomInfo.value;
      if (room && room.id) {
        store.dispatch("room/initRoom", {
          agora: {
            appId: AGORA_APP_ID,
            appCertificate: "",
            webConfig: {
              mode: "rtc",
              codec: "vp8",
              role: "host",
            },
            user: {
              channel: room.agoraInfo.chanelId,
              username: room.agoraInfo.userId,
              // token: room.agoraInfo.token,
              token: "0063cdc43f147ef48258ffb47de6ceb6ca7IAD5Xk/fO8rsRQ0jnkv4Z3wZNhdyPrnckThjgvCz96n6+cPJjm8h39v0IgD+TsJfC+q/XwQAAQA6Qr5fAgA6Qr5fAwA6Qr5fBAA6Qr5f",
              // token: "0063cdc43f147ef48258ffb47de6ceb6ca7IADmNwH9E/Hw7x9We6TekU6oz3ukgwd0JvfasN21QSoV2sPJjm/gemqmIgAZdw6tfoS/XwQAAQAOQb5fAgAOQb5fAwAOQb5fBAAOQb5f",
              role: "host",
            },
          },
        });
        router.replace("/class/" + room.id);
      }
    });
    return { classes, username };
  },
});

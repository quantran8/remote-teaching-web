// import { GLGlobal } from '@/commonui';
import hubConnection from '@/ws';
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const openPrivacyPolicy = () => {
      // window.open(`${GLGlobal.authorityUrl()}/Copyright/PrivacyPolicy`);
      hubConnection.invoke("TestSendMessage",
      {
         message: "Test Message"
      }
  );
    };
    return { openPrivacyPolicy };
  },
});

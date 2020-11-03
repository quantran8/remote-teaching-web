import { randomUUID } from "@/utils/utils";
import { defineComponent } from "vue";
import ClassCard from "./components/class-card/class-card.vue";
export default defineComponent({
  components: {
    ClassCard,
  },
  setup() {
    const classes = [
      {
        id: randomUUID(),
        title: "GrapeSEED Class 1",
        description: "Unit 11 Lesson 1",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 2",
        description: "Unit 11 Lesson 2",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 3",
        description: "Unit 11 Lesson 3",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 4",
        description: "Unit 11 Lesson 4",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 5",
        description: "Unit 11 Lesson 5",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 6",
        description: "Unit 11 Lesson 6",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 7",
        description: "Unit 11 Lesson 7",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 8",
        description: "Unit 11 Lesson 8",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 9",
        description: "Unit 11 Lesson 9",
      },
      {
        id: randomUUID(),
        title: "GrapeSEED Class 10",
        description: "Unit 11 Lesson 10",
      },
    ];
    return {
      classes,
    };
  },
});

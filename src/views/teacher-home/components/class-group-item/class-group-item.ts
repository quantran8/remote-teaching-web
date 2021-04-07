import { defineComponent, PropType } from "vue";
import { TeacherClassModel } from "@/models";
import ClassCard from "../class-card/class-card.vue";
import GroupCard from "../group-card/group-card.vue";
import Between from "../class-group-between/class-group-between.vue";

export default defineComponent({
	components: {
		ClassCard,
		GroupCard,
		Between
	},
	props: {
		schoolClass: {
			type: Object as PropType<TeacherClassModel>,
			required: true
		},
		onClickClass: {
			type: Function,
			required: true
		},
		canStartSession: {
			type: Function,
			required: true
		}
	},

	setup() {
		return {};
	},
});

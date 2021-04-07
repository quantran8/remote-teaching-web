import { formatDate4Y2M2D } from "@/utils/utils";
import { defineComponent } from "vue";

export default defineComponent({
	props: {
		id: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		studentCount: {
			type: Number,
			required: true,
		},
		nextSchedule: {
			type: Date,
			required: true,
		},
	},
	setup() {
		return { formatDate: formatDate4Y2M2D };
	},
});

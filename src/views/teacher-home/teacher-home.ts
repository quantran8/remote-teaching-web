import { LoginInfo } from "@/commonui";
import { TeacherClassModel } from "@/models";
import { ResourceModel } from "@/models/resource.model";
import { AccessibleClassQueryParam, AccessibleSchoolQueryParam, LessonService, RemoteTeachingService } from "@/services";
import { computed, defineComponent, onUpdated } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ClassGroupItem from "./components/class-group-item/class-group-item.vue";

export default defineComponent({
	components: {
		ClassGroupItem
	},
	async created() {
		const store = useStore();
		const logginInfo: LoginInfo = store.getters["auth/loginInfo"];
		if (logginInfo && logginInfo.loggedin) {
			await store.dispatch("teacher/loadAccessibleSchools", {
				disabled: false,
			} as AccessibleSchoolQueryParam);

			const schools: ResourceModel[] = store.getters["teacher/schools"];

			if (schools && schools.length) {
				store.dispatch("teacher/loadAccessibleClasses", {
					schoolId: schools[0].id,
					disabled: false,
					isDetail: false,
					isCampusDetail: true
				} as AccessibleClassQueryParam);
			}
		}
	},
	setup() {
		const store = useStore();
		const router = useRouter();
		const schools = computed(() => store.getters["teacher/schools"]);
		const classes = computed(() => store.getters["teacher/classes"]);
		const username = computed(() => store.getters["auth/username"]);
		const startClass = async (teacherClass: TeacherClassModel) => {
			try {
				// const lessons = await LessonService.getLessonByUnit(11);
				// let lesson = lessons.find((ele) => parseInt(ele.title) === 16);
				// if (!lesson) lesson = lessons[0];
				const response = await RemoteTeachingService.teacherStartClassRoom(
					teacherClass.schoolClassId,
					teacherClass.schoolClassId
				);
				if (response && response.success) {
					router.push("/class/" + teacherClass.schoolClassId);
				} else {
					console.log(response);
				}
			} catch (err) {
				if (err && err.body) {
					const responseError: {
						data: {
							Code: string;
							Message: string;
							Success: boolean;
						};
						success: boolean;
					} = err.body;
					if (responseError && !responseError.success) {
						console.log("ERROR", responseError.data.Message);
					}
				}
			}
		};
		const onSchoolChange = (e: any) => {
			const schoolId = e.target.value;

			store.dispatch("teacher/loadAccessibleClasses", {
				schoolId,
				disabled: false,
				isDetail: false,
				isCampusDetail: true
			} as AccessibleClassQueryParam);
		};

		const onClickClass = (teacherClass: TeacherClassModel) => {
			if (teacherClass.isActive) {
				router.push("/class/" + teacherClass.schoolClassId);
			} else {
				startClass(teacherClass);
			}
		};

		return { schools, classes, username, onClickClass, onSchoolChange };
	},
});

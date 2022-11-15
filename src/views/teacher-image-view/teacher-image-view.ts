import { computed, defineComponent, ref, onMounted, watch } from 'vue';
import {Radio,Select, Button, Calendar, Input, Table, Modal, DatePicker, Popconfirm } from "ant-design-vue";
import { useStore } from 'vuex';
import  {Moment} from 'moment';
import { AccessibleSchoolQueryParam } from '@/services';
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useRoute } from 'vue-router';
import { RoomModel } from '@/models';
import { FilterMode } from '@/utils/utils';
import { BlobTagItem } from '@/services/storage/interface';
import { StudentsGroup } from '@/store/teacher/state';
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { RadioChangeEvent } from 'ant-design-vue/lib/radio';

const fpPromise = FingerprintJS.load();
interface Value {
	value: string;
	label: string;
	key?: string
}
export default defineComponent({
	components:{
		Radio,
		RadioGroup:Radio.Group,
		Select,
		Option:Select.Option,
		Button,
		Calendar,
		Input,
		Table,
		Modal,
		Swiper,
		SwiperSlide,
		DatePicker,
		Popconfirm
	},
	setup(){

		const { getters, dispatch} = useStore();
		const {schoolId,studentId} = useRoute().params;
		const classesSchedules = computed(() => getters["teacher/classesSchedules"]);
		const schools = computed(() => getters["teacher/schools"]);
		const studentsGroup = computed<Array<StudentsGroup>>(() => getters["teacher/currentStudentsGroup"]);
		const classInfo = computed<RoomModel>(() => getters["teacherRoom/info"]);
		const userInfo = computed(() => getters["auth/getLoginInfo"]);
		const studentsImageCaptured = computed<Array<BlobTagItem>>(() => getters["teacherRoom/studentsImageCaptured"]);
		const visitorId = ref("");
		const listDateByStudent = computed(() => {
			const listDate: Array<string> = [];
				studentsImageCaptured.value.filter(blob => blob.tags.studentId === filterOptions.value.student)?.forEach((item) => {
					if(!listDate.includes(item.tags.dateTime)){
						listDate.push(item.tags.dateTime)
					}
				});
			return listDate;
		});
		const schoolOptions = computed(() => schools.value?.map((school: any) => ({value: school.id , label: school.name})) ?? []);
		const classOptions = computed<Array<Value>>(() => classesSchedules.value?.map((c: any) => ({value: c.classId , label: c.className})) ?? []);
		const studentOptions = computed<Array<Value>>(() => (studentsGroup.value?.map(student => ({value: student.studentId , label: student.nativeName})) ?? []));
		const groupOptions = computed<Array<Value>>(() => {
				return classesSchedules.value
										.find((c: any) => c.classId === classSelected.value.value)?.groups
										.map((group: any) => ({value: group.groupId , label:`${group.groupName} ${filterMode.value === FilterMode.Student ? "" : '(' +classesSchedules.value[0]?.className +')' ?? ""}`})) ?? [];	
		});
		const classSelected = computed(() => {
			if(filterOptions.value.class){
				return {
					value: filterOptions.value.class,
				}
			}
			if(classOptions.value.length){
				return {
					value: classOptions.value[0].value
				}
			}
			return  {
				value: ""
			}
		});
		const schoolSelected = computed(() => {
			if(filterOptions.value.school){
				return {
					value: filterOptions.value.school
				}
			}
			if(schoolOptions.value.length){
				return {
					value:schoolOptions.value[0].value
				}
			}
			return {
				value: ""
			}
			
		});
		const groupSelected = computed(() => {
			if(filterOptions.value.group){
				return {
					value: filterOptions.value.group
				}
			}
			if(groupOptions.value.length){
				return {
					value:groupOptions.value[0].value
				}
			}
			return {
				value: ""
			}
		});
		const studentSelected = computed(() => {
			if(filterOptions.value.student){
				return {
					value:filterOptions.value.student
				}
			}
			if(studentOptions.value.length){
				return {
					value:studentOptions.value[0]?.value
				}
			}
			return {
				value: ""
			}
		});
		const modules = [Pagination,Navigation];
		const currentDate = ref("");
		const calendarValue = ref<Moment>();
		const isShowCalendar = ref(false);
		const isShowImageModal = ref(false);
		const filterMode = ref(FilterMode.Student);
		const filterOptions = ref({
			filterMode:filterMode.value,
			school:"",
			class: "",
			group: "",
			student: "",
			date:"",
		});
		const carouselDataSource = ref<Array<BlobTagItem>>([]);
		const columns = computed(() => [
			{
				title: filterMode.value === FilterMode.Student ? "Session" : "Student",
				dataIndex: filterMode.value === FilterMode.Student ? "session" : "student",
				key: filterMode.value === FilterMode.Student ? "session" : "student",
			},
			{
				title: "Count",
				dataIndex: "count",
				key: 'count',
				slots: { customRender: 'count' },

			},
		])
		const tableDataSources = computed(() => {
			if (filterMode.value === FilterMode.Student) {
				return listDateByStudent.value.map((date: string) => ({
					key: date,
					session: date,
					count: studentsImageCaptured.value.filter(item => item.tags.dateTime === date && item.tags.studentId === filterOptions.value.student).length
				}));
			}
			return studentsGroup.value.map(student => ({
				key: student.studentId,
				student: student.nativeName,
				count: currentDate.value ? studentsImageCaptured.value.filter(item => item.tags.studentId === student.studentId && item.tags.dateTime === currentDate.value).length : 0
			}));
		}
		)
		const getStorageImages = async () => {
			 await dispatch('teacherRoom/getStudentCapturedImages', {
				token: userInfo.value.access_token,
				schoolId: filterOptions.value.school,
				sessionId: filterOptions.value.school,
				classId: filterOptions.value.class,
				groupId: filterOptions.value.group,
				studentId: filterOptions.value.student,
				date: filterOptions.value.date,
				filterMode: filterMode.value
			});
		}
		
		const handleChangeRadioSelected = async(e: RadioChangeEvent) => {
			filterMode.value = e.target.value;
			filterOptions.value.filterMode = filterMode.value;
			if(classSelected.value.value && groupSelected.value.value){
				await dispatch('teacher/getClassInfo', {
					classId: classSelected.value.value,
					groupId: groupSelected.value.value,
					teacherId: userInfo.value.profile.sub
				});
				await getStorageImages();
			}
		}
		const handleChangeClass = async (value: Value) => {
			filterOptions.value.class = value.value;
			filterOptions.value.group = classesSchedules.value.find((c: any) => c.classId === classSelected.value.value)?.groups[0].groupId;
			if(filterOptions.value.group){
				await dispatch('teacher/getClassInfo', {
					classId: value.value,
					groupId: filterOptions.value.group,
					teacherId: userInfo.value.profile.sub
				});
				filterOptions.value.student = studentOptions.value[0]?.value ?? "";
				if(filterOptions.value.student){
					await getStorageImages();
				}

			}
		}
		const handleChangeGroup =  async(value: Value) => {
			await dispatch('teacher/getClassInfo', {
				classId: filterOptions.value.class,
				groupId: value.value,
				teacherId: userInfo.value.profile.sub
			});
			filterOptions.value.group = value.value;
			filterOptions.value.student = studentOptions.value[0]?.value ?? "";
			if(filterOptions.value.student){
				await getStorageImages();
			}
		}
		const handleChangeStudent = async (value: Value) => {
			filterOptions.value.student = value.value;
			await getStorageImages();
			}
		const handleChangeSchool = async(value: Value) => {
			filterOptions.value.school = value.value;
			await dispatch("teacher/loadAllClassesSchedules", {
				schoolId: value.value,
				browserFingerPrinting: visitorId.value,
			});
			if(classOptions.value.length && groupOptions.value.length){
				await dispatch('teacher/getClassInfo', {
					classId: classOptions.value[0]?.value,
					groupId: groupOptions.value[0]?.value,
					teacherId: userInfo.value.profile.sub
				});
				filterOptions.value.class = classOptions.value[0]?.value;
				filterOptions.value.group = groupOptions.value[0]?.value;
				await getStorageImages();
			}
			else{
				filterOptions.value.class = "";
				filterOptions.value.student = "";
				filterOptions.value.group = "";
				await dispatch("teacher/setCurrentGroupStudents",[]);
			}
		}
		const handleChangeDate = (value: Moment) => {
			if(!value){
				return;
			}
				isShowCalendar.value = false;
				currentDate.value = value.format("yyyy-MM-DD");
		}
		const handleShowImage = (value: any) => {
			isShowImageModal.value = !isShowImageModal.value;
			carouselDataSource.value = studentsImageCaptured.value.filter(item => {
				if(filterMode.value === FilterMode.Student){
					return item.tags.dateTime === value.key;
				}
				if(currentDate.value){
					return item.tags.dateTime === currentDate.value&& 
					item.tags.schoolId === filterOptions.value.school && 
					item.tags.groupId === filterOptions.value.group && 
					item.tags.studentId === value.key
				}
				return;
			});		
		}
		const removeImage = async(imageName: string) => {
			const data = studentsImageCaptured.value.filter(item => item.blobName !== imageName);
			carouselDataSource.value = carouselDataSource.value.filter(item => item.blobName !== imageName);
			await dispatch("teacherRoom/setStudentsImageCaptured", data)
			await dispatch('teacherRoom/removeStudentImage', {
				token: userInfo.value.access_token,
				fileName:imageName
			});
		}
		const blobNameToUrl = (blobName: string) => {
			return process.env.VUE_APP_STORAGE_URL+blobName;
		}

		onMounted(async() => {
			const fp = await fpPromise;
			const result = await fp.get();
			visitorId.value = result.visitorId;
			await dispatch("teacher/loadAccessibleSchools", {
				disabled: false,
			} as AccessibleSchoolQueryParam);
			await dispatch("teacher/loadAllClassesSchedules", {
				schoolId: schoolId,
				browserFingerPrinting: visitorId.value,
			});
			await dispatch('teacher/getClassInfo', {
				classId: classSelected.value?.value,
				groupId:  studentId ? groupOptions.value?.find((item) => item.value === classInfo.value?.classInfo.groupId)?.value ?? "" : groupOptions.value[0]?.value,
				teacherId: userInfo.value.profile.sub
			});
			filterOptions.value = {
				filterMode:filterMode.value,
				school: schoolId as string ?? schoolOptions.value[0].value ,
				class: classSelected.value?.value ?? "",
				group:  studentId ? groupOptions.value?.find((item) => item.value === classInfo.value?.classInfo.groupId)?.value ?? "" : groupOptions.value[0]?.value,
				student: studentId ? studentId as string : studentOptions.value[0]?.value,
				date: ""
			};
			await getStorageImages();
				

		})
		return{
			filterMode,
			groupOptions,
			schools,
			classesSchedules,
			currentDate,
			classOptions,
			schoolOptions,
			studentOptions,
			isShowCalendar,
			columns,
			tableDataSources,
			isShowImageModal,
			filterOptions,
			classSelected,
			groupSelected,
			studentSelected,
			carouselDataSource,
			FilterMode,
			modules,
			calendarValue,
			schoolSelected,
			removeImage,
			handleChangeDate,
			handleChangeRadioSelected,
			handleChangeClass,
			handleChangeGroup,
			handleChangeStudent,
			handleChangeSchool,
			handleShowImage,
			blobNameToUrl,
			getStorageImages
		}
	}
})
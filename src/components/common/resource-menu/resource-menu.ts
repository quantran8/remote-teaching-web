import { computed, defineComponent, ref } from "vue";
import { fmtMsg, DropdownItem, DropdownHelper, HeaderMenuItem, GLGlobal, RoleName } from "vue-glcommonui";
import { ResourcesMenuLocale } from "@/locales/localeid";
import { PermissionService } from "@/services";

interface ResourceMenuItem {
  textLocaleId: string;
  url?: string;
  color: string;
  action?: string;
}

enum ResourceAction {
  TrainingPortal = "GS_Home_Training",
  ReportPortal = "GS_Home_Report",
  StudentPortal = "GS_Home_Student",
  ContentPortal = "GS_Home_Resource",
  LMS = "GS_Home_LMS",
}

export default defineComponent({
  components: {
    DropdownItem,
    DropdownHelper,
    HeaderMenuItem,
  },
  setup() {
    const permissions = ref<string[]>([]);
    const permissionsLoaded = ref(false);
    const isActionValid = (action: string) => permissionsLoaded.value && permissions.value.includes(action);
    const loginInfo = GLGlobal.loginInfo();
    const roleIds = loginInfo.profile.roleInfos.map((roleinfo: any) => roleinfo.id);
    PermissionService.getPermissionNames({ roleIds }).then((permissionNames: any) => {
      permissionsLoaded.value = true;
      permissions.value = permissionNames;
    });
    const resources: ResourceMenuItem[] = [
      {
        textLocaleId: ResourcesMenuLocale.ResourcesMenuSchoolPortal,
        url: process.env.VUE_APP_URL_SCHOOL_PORTAL,
        color: "#00591c",
      },
      {
        textLocaleId: ResourcesMenuLocale.ResourcesMenuDigitalContent,
        url: process.env.VUE_APP_URL_CONTENT_PORTAL,
        action: ResourceAction.ContentPortal,
        color: "#b84c97",
      },
      {
        textLocaleId: ResourcesMenuLocale.ResourcesMenuReports,
        url: process.env.VUE_APP_URL_REPORT_PORTAL,
        action: ResourceAction.ReportPortal,
        color: "#cd6814",
      },
      {
        textLocaleId: ResourcesMenuLocale.ResourcesMenuStudentREP,
        url: process.env.VUE_APP_URL_STUDENT_PORTAL,
        action: ResourceAction.StudentPortal,
        color: "#1890ff",
      },
      {
        textLocaleId: ResourcesMenuLocale.ResourcesMenuTeacherTraining,
        url: process.env.VUE_APP_URL_TRAINING_PORTAL,
        action: ResourceAction.TrainingPortal,
        color: "#008b9c",
      },
      {
        textLocaleId: ResourcesMenuLocale.ResourcesMenuLMS,
        url: process.env.VUE_APP_URL_LMS,
        action: ResourceAction.LMS,
        color: "#008b9c",
      },
      {
        textLocaleId: ResourcesMenuLocale.ResourcesParentPortal,
        url: process.env.VUE_APP_URL_PARENT_PORTAL,
        color: "#5c2d91",
      },
    ];
    const roles = loginInfo.profile.roles;
    const isParent = roles.indexOf(RoleName.parent) !== -1;
    const filterResources = (resources: ResourceMenuItem[]) =>
      resources.filter((resource: ResourceMenuItem) => {
        if (resource.action) {
          return isActionValid(resource.action);
        }
        if (resource.textLocaleId === ResourcesMenuLocale.ResourcesMenuSchoolPortal) {
          return !(isParent && roles.length === 1);
        }
        if (resource.textLocaleId === ResourcesMenuLocale.ResourcesParentPortal) {
          return isParent;
        }
        return true;
      });
    const sortResources = (resources: ResourceMenuItem[]) =>
      resources.sort((a, b) => {
        return fmtMsg(a.textLocaleId).localeCompare(fmtMsg(b.textLocaleId));
      });
    const displayedResources = computed(() => {
      return sortResources(filterResources(resources));
    });
    return {
      displayedResources,
      fmtMsg,
    };
  },
});

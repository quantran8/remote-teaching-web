declare namespace NodeJS {
	export interface ProcessEnv {
		VUE_APP_ENVIRONMENT: string;
		VUE_APP_CLIENT_URL: string;
		VUE_APP_API_GETWAY: string;
		VUE_APP_PORTAL_DOMAIN: string;
		VUE_APP_REMOTE_TEACHING_SERVICE: string;
		VUE_APP_API_PREFIX: string;
		VUE_APP_AUTHORITY_URL: string;
		VUE_APP_AUTHORITY_CLIENT_ID: string;
		VUE_APP_AUTHORITY_CLIENT_SECRET: string;
	}
}

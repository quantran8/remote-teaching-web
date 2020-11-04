export interface Permission {
	id: number;
	name: string;
	isVisible: boolean;
	items: Permission[] | null;
}

export interface Profile {
	amr: string[];
	auth_time: number;
	email: string;
	idp: string;
	name: string;
	sid: string;
	sub: string;
	roles: string[];
	roleInfos: { id: string; name: string }[];
	permissions: Permission[];
	[prop: string]: any;
	avatarUrl: string | null;
}

export interface LoginInfo {
	id_token: string;
	session_state: any;
	access_token: string;
	refresh_token: string;
	token_type: string;
	scope: string;
	profile: Profile;
	expires_at: number;
	state: any;

	toStorageString(): string;

	readonly expires_in: number | undefined;
	readonly expired: boolean | undefined;
	readonly scopes: string[];
	loggedin?: boolean;
}

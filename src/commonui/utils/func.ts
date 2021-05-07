import i18n from "../locales/i18n";

const buildSuffix = (suffix: any, key: any) => {
	return suffix ? (suffix.startsWith(key) ? suffix : `${key}${suffix}`) : "";
};

const buildUrl = (page: any) => {
	try {
		if (typeof page === "string") {
			return page;
		} else {
			const { pathname, search, hash } = page as { pathname: string; search: string; hash: string };

			return `${pathname}${buildSuffix(search, "?")}${buildSuffix(hash, "#")}`;
		}
	} catch (e) {
		// diagnosticLogError({ error: e, message: 'buildUrl' })
		console.error(e);
		return "/";
	}
};

export function locationReplace(page: string) {
	window.location.replace(buildUrl(page));
}

export const FormatMessage = (id: string, params?: any): string => {
	return i18n.global.t(id, params) as string;
};

export const fmtMsg = FormatMessage;

export function isLocalEnvironment(): boolean {
	return process.env.VUE_APP_ENVIRONMENT === "local";
}

export function starPolygonPoints(spikeCount: any, outerRadius: any, innerRadius: any) {
	let rot = (Math.PI / 2) * 3;
	const cx = outerRadius;
	const cy = outerRadius;
	const sweep = Math.PI / spikeCount;
	const points = [];

	for (let i = 0; i < spikeCount; i++) {
		let x = cx + Math.cos(rot) * outerRadius;
		let y = cy + Math.sin(rot) * outerRadius;
		points.push({ x: x, y: y });
		rot += sweep;

		x = cx + Math.cos(rot) * innerRadius;
		y = cy + Math.sin(rot) * innerRadius;
		points.push({ x: x, y: y });
		rot += sweep;
	}
	return points;
}

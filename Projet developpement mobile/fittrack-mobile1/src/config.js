import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '8082';
const FALLBACK_LAN_HOST = process.env.EXPO_PUBLIC_API_LAN_HOST || '192.168.100.83';

function normalizeHost(raw) {
	if (!raw) {
		return null;
	}

	const withoutProtocol = raw.replace(/^[a-z]+:\/\//i, '');
	const firstPart = withoutProtocol.split('/')[0];
	return firstPart.split(':')[0] || null;
}

function isIpv4(host) {
	return /^(\d{1,3}\.){3}\d{1,3}$/.test(host || '');
}

function getHostFromExpoConfig() {
	const hostUri =
		Constants.expoConfig?.hostUri ||
		Constants.manifest2?.extra?.expoGo?.debuggerHost ||
		'';

	const host = normalizeHost(hostUri);
	if (!host) {
		return null;
	}

	// In tunnel mode Expo may expose *.exp.direct, which is not your Spring API host.
	if (!isIpv4(host)) {
		return null;
	}

	return host;
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

function resolveApiBaseUrls() {
	const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
	const expoHost = getHostFromExpoConfig();

	const hosts = [
		expoHost,
		process.env.EXPO_PUBLIC_API_LAN_HOST,
		FALLBACK_LAN_HOST,
		Platform.OS === 'android' ? '10.0.2.2' : null,
		Platform.OS === 'android' ? '10.0.3.2' : null,
		'localhost',
		'127.0.0.1',
	];

	const hostUrls = unique(hosts).map((host) => `http://${host}:${API_PORT}`);
	if (envUrl) {
		return unique([envUrl, ...hostUrls]);
	}

	return hostUrls;
}

export const API_BASE_URLS = resolveApiBaseUrls();
export const API_BASE_URL = API_BASE_URLS[0];

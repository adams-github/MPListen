import request from "@/utils/request.js"

const BASE_URL_NETEASE = "https://music.163.com";
const URL_SEARCH = "/api/search/pc";

/**
 * 网易云的接口必须加上cookie，不然会返回-462的报错
 */
export function neteaseSearch(label, curPage) {
	const request_url = BASE_URL_NETEASE + URL_SEARCH;
	const request_data = {
		s: label,
		offset: 20 * (curPage - 1),
		limit: 20,
		type: '1',
	};
	const request_method = "POST";
	const request_header = {
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
		'cookie': 'NMTID=00On-HgH9ZroRVOqkTOof-fqShT_IsAAAGFFkPB_Q',
	};
	return request({
		request_url,
		request_data,
		request_method,
		request_header
	});
}

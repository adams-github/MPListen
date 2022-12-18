import requester from "@/utils/request.js"

const BASE_URL_KUWO = "https://www.kuwo.cn";
const URL_SEARCH_KUWO = "/api/www/search/searchMusicBykeyWord";

/**
 * 酷我的接口必须要传referer, csrf, cookie
 * 而且referer必须要为https://www.kuwo.cn，暂时无法实现
 */
export function kuwoSearch(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_KUWO + URL_SEARCH_KUWO;
	const request_data = {
		key: label,
		pn: curPage,
		rn: 20
	};
	const request_method = "GET";
	const request_header = {
		'referer': 'https://www.kuwo.cn',
		'csrf': 'RVFEJULHRY',
		'cookie':'kw_token=RVFEJULHRY'
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		console.log(res);
		if (res.code === 200) {
			if (typeof successCb === 'function') {
				let songList = [];
				res.res.list.forEach((item, index) => {
					songList.push({
						platform: 'kuwo',
						id: item.rid,
						name: item.name,
						url: '',
						singer: item.artist,
						albumName: item.album,
						albumUrl: item.albumpic,
						albumId: item.albumid
					})
				});
				successCb(songList);
			}
		} else {
			if (typeof errorCb === 'function') {
				console.log(res.msg);
				errorCb(res.msg);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

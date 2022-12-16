import request from "@/utils/request.js"

const BASE_URL_KUWO = "https://www.kuwo.cn";
const URL_SEARCH = "/api/www/search/searchMusicBykeyWord";

/**
 * 酷我的接口必须要传referer, csrf, cookie
 * 微信小程序中，referer无法修改，所以微信小程序无法执行此方法
 */
export function kuwoSearch(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_KUWO + URL_SEARCH;
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
	request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((data) => {
		console.log(data);
		if (data.code === 200) {
			if (typeof successCb === 'function') {
				let songList = [];
				data.data.list.forEach((item, index) => {
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
				console.log(data.msg);
				errorCb(data.msg);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

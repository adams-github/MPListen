import requester from "@/utils/request.js"

const BASE_URL_QQ = "https://u.y.qq.com";
const URL_SEARCH_QQ = "/cgi-bin/musicu.fcg";

export function qqSearch(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_QQ + URL_SEARCH_QQ;
	const request_data = {
		comm: {
			ct: '19',
			cv: '1859',
			uin: '0'
		},
		req: {
			method: 'DoSearchForQQMusicDesktop',
			module: 'music.search.SearchCgiService',
			param: {
				grp: 1,
				num_per_page: 20,
				page_num: curPage,
				query: label,
				search_type: 0
			}
		}
	}
	const request_method = "POST";
	const request_header = {
		'Content-Type': 'application/json;charset=UTF-8',
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === 0 && res.req.code === 0) {
			if (typeof successCb === 'function') {
				let songList = [];
				res.req.data.body.song.list.forEach((item, index) => {
					songList.push({
						platform: 'qq',
						id: item.id,
						name: item.name,
						url: '',
						singer: item.singer[0].name,
						albumName: item.album.name,
						albumUrl: '',
						albumId: item.id
					})
				});
				successCb(songList);
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb("请求失败: qqSearch()");
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

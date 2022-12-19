import requester from "@/utils/request.js"

const BASE_URL_QQ = "https://u.y.qq.com";
const URL_SEARCH_QQ = "/cgi-bin/musicu.fcg";

let qqJs = {};

qqJs.qqSearch = function(label, curPage, successCb, errorCb) {
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
						id: item.mid,
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

/**
 * 通过歌曲的id来获取mp3的播放连接，大概率也是有播放期限限制的(路径带有日期)
 */
qqJs.qqSongUrl = function(songId, successCb, errorCb) {
	const request_url = BASE_URL_QQ + URL_SEARCH_QQ;
	const reqData = {
		req_0: {
			module: 'vkey.GetVkeyServer',
			method: 'CgiGetVkey',
			param: {
				filename: ['M500' + songId + songId + '.mp3'],
				guid: '10000',
				songmid: [songId + ''],
				songtype: [0],
				uin: '0',
				loginflag: 1,
				platform: '20',
			},
		},
		loginUin: '0',
		comm: {
			uin: '0',
			format: 'json',
			ct: 24,
			cv: 0
		}
	};
	const request_data = {
		format: 'json',
		data: JSON.stringify(reqData),
	}
	const request_method = "GET";
	const request_header = {};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === 0 && res.req_0.code === 0) {
			if (res.req_0.data.midurlinfo[0].purl != undefined && res.req_0.data.midurlinfo[0].purl != '') {
				if (typeof successCb === 'function') {
					successCb(res.req_0.data.sip[0] + res.req_0.data.midurlinfo[0].purl);
				}
			} else {
				if (typeof errorCb === 'function') {
					errorCb('QQ平台没有版权或需要VIP');
				}
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb("请求失败: qqSongUrl()");
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
};

export default qqJs

import requester from "@/utils/request.js"

const BASE_URL_QQ = "https://u.y.qq.com";
const URL_SEARCH_QQ = "/cgi-bin/musicu.fcg";
const URL_LYRIC_QQ = "https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg";

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
					let free = item.pay.pay_play == 0 && item.action.alert != 0;
					let songId = item.mid;
					let songName = item.name;
					let album_name = item.album.name;
					let singerName = '';
					item.singer.forEach((singer_name, idx) => {
						if (idx != 0) {
							singerName += '、';
						}
						singerName += singer_name.name;
					});
					if (!free) {
						for (let i = 0; i < item.grp.length; i++) {
							if (item.grp[i].pay.pay_play == 0 && item.grp[i].action.alert != 0) {
								songId = item.grp[i].mid;
								songName = item.grp[i].name;
								album_name = item.grp[i].album.name;
								singerName = '';
								item.grp[i].singer.forEach((singer_name, idx) => {
									if (idx != 0) {
										singerName += '、';
									}
									singerName += singer_name.name;
								});
								free = true;
								break;
							}
						}
					}
					let picUrl = '../../static/ic_main_cd_default.jpg';
					if (item.album.mid != '') {
						picUrl = 'https://y.gtimg.cn/music/photo_new/T002R500x500M000' +
							item.album.mid + '.jpg';
					} else if (item.singer[0].mid != '') {
						picUrl = 'https://y.qq.com/music/photo_new/T001R500x500M000' +
							item.singer[0].mid + '.jpg';
					}
					songList.push({
						platform: 'qq',
						id: songId,
						name: songName,
						url: '',
						singer: singerName,
						albumName: album_name,
						albumUrl: picUrl,
						isFree: free,
						hasCache: false,
						delete: false,
						savedFilePath:'',
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
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

/**
 * 通过歌曲的id来获取mp3的播放连接，大概率是有播放期限限制的(路径带有日期)
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
					errorCb('需要QQ VIP或没有音源');
				}
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb("请求失败: qqSongUrl()");
			}
		}
	}).catch((error) => {
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
};

/**
 * qq平台的歌词接口对header中的referer字段做了判断，所以qq平台的歌词无法获取
 */
qqJs.qqlyric = function(songId, successCb, errorCb) {
	const request_url = URL_LYRIC_QQ;
	const request_data = {
		songmid: songId,
		g_tk: 5381,
		format: 'json',
		inCharset: 'utf8',
		outCharset: 'utf-8',
		nobase64: 1
	}
	const request_method = "GET";
	const request_header = {
		'content-type': 'text/html;charset=utf-8',
		'referer': 'https://y.qq.com/'
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === 0) {
			if (typeof successCb === 'function') {
				successCb(res.lyric);
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb("请求失败: qqlyric()");
			}
		}
	}).catch((error) => {
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

export default qqJs;

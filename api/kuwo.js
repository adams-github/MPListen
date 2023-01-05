import requester from "@/utils/request.js"

const URL_KUWO_SERACH = "https://search.kuwo.cn/r.s";
const BASE_URL_KUWO = "https://www.kuwo.cn";
const URL_SEARCH_KUWO = "/api/www/search/searchMusicBykeyWord";
const URL_MP3_KUWO = "https://antiserver.kuwo.cn/anti.s";
const URL_MP3_INFO_KUWO = "https://m.kuwo.cn/newh5/singles/songinfoandlrc";

let kuwoJs = {}

/**
 * https://www.kuwo.cn中，酷我的接口必须要传referer, csrf, cookie
 * 而且referer必须要为https://www.kuwo.cn，暂时无法实现
 */
kuwoJs.kuwoSearch = function(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_KUWO + URL_SEARCH_KUWO;
	const request_data = {
		key: label,
		pn: curPage,
		rn: 20
	};
	const request_method = "GET";
	const request_header = {
		'referer': 'https://www.kuwo.cn',
		'csrf': 'PA2FX2RWJ4H',
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
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
						isFree: true,
						hasCache: false,
						delete: false,
						savedFilePath: '',
					})
				});
				successCb(songList);
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.msg);
			}
		}
	}).catch((error) => {
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}


kuwoJs.kuwoSearchForWX = function(label, curPage, successCb, errorCb) {
	const request_url = URL_KUWO_SERACH;
	const request_data = {
		all: label,
		pn: (curPage - 1),
		rn: 20,
		ft: 'music',
		encoding: 'utf8',
		rformat: 'json',
		mobi: 1,
		display_type: 2,
		vipver: '10.3.2.0',
		stype: 'comprehensive',

		user: 'fa205f414ddefc1e',
		android_id: 'fa205f414ddefc1e',
		prod: 'kwplayer_ar_10.3.2.0',
		corp: 'kuwo',
		source: 'kwplayer_ar_10.3.2.0_40.apk',
		loginUid: 0,
		loginSid: 0,
		client: 'kt'
	};
	const request_method = "GET";
	const request_header = {};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (typeof successCb === 'function') {
			let songList = [];
			res.abslist.forEach((item, index) => {
				let songName = item.SONGNAME;
				if (item.SONGNAME.indexOf('-') != -1) {
					songName = item.SONGNAME.substr(0, item.SONGNAME.indexOf('-'));
					let subTitle = item.SONGNAME.substr(item.SONGNAME.indexOf('-') + 1);
				}
				songList.push({
					platform: 'kuwo',
					id: item.DC_TARGETID,
					name: songName,
					url: '',
					singer: item.ARTIST,
					albumName: item.ALBUM,
					albumUrl: '',
					isFree: true,
					hasCache: false,
					delete: false,
					savedFilePath: '',
				})
			});
			successCb(songList);
		}
	}).catch((error) => {
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

kuwoJs.kuwoSongUrl = function(songId, successCb, errorCb) {
	const request_url = URL_MP3_KUWO;
	const request_data = {
		type: 'convert_url',
		format: 'mp3',
		response: 'url',
		rid: songId
	};
	const request_method = "GET";
	const request_header = {};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (typeof successCb === 'function') {
			successCb(res);
		}
	}).catch((error) => {
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

kuwoJs.kuwoSongInfo = function(songId, successCb, errorCb) {
	const request_url = URL_MP3_INFO_KUWO;
	const request_data = {
		musicId: songId
	};
	const request_method = "GET";
	const request_header = {};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.status === 200) {
			if (typeof successCb === 'function') {
				let picUrl = res.data.songinfo.pic;
				if (picUrl.indexOf('240') != -1) {
					picUrl = picUrl.replace('240', '700');
				}
				let data = {
					lrclist: res.data.lrclist,
					img: picUrl
				}
				successCb(data);
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.msg);
			}
		}
	}).catch((error) => {
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

export default kuwoJs;

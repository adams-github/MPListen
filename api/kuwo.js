import requester from "@/utils/request.js"

const URL_KUWO_SEARCH = "https://www.kuwo.cn/api/www/search/searchMusicBykeyWord";
const URL_KUWO_SERACH_APP = "https://search.kuwo.cn/r.s";
const URL_KUWO_SERACH_MPWX = "https://appi.kuwo.cn/api/wechat/v1/search/musics-and-exact-artist";
const URL_MP3_KUWO = "https://antiserver.kuwo.cn/anti.s";
const URL_INFO_KUWO = "https://m.kuwo.cn/newh5/singles/songinfoandlrc";

let kuwoJs = {}

/**
 * https://www.kuwo.cn中，酷我的接口必须要传referer, csrf, cookie
 * 而且referer必须要为https://www.kuwo.cn，暂时无法实现
 */
kuwoJs.kuwoSearch = function(label, curPage, successCb, errorCb) {
	const request_url = URL_KUWO_SEARCH;
	const request_data = {
		key: label,
		pn: curPage,
		rn: 20
	};
	const request_method = "GET";
	const request_header = {
		'Referer': 'https://www.kuwo.cn',
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
						localPath: '',
						duration: 0,
					})
				});
				successCb(songList);
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.msg);
			}
		}
	}).catch((errMsg) => {
		console.error(errMsg);
		if (typeof errorCb === 'function') {
			errorCb(errMsg);
		}
	});
}


kuwoJs.kuwoSearchForAPP = function(label, curPage, successCb, errorCb) {
	const request_url = URL_KUWO_SERACH_APP;
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
					urlTime: -1,
					localPath: '',
					duration: 0,
				})
			});
			successCb(songList);
		}
	}).catch((errMsg) => {
		console.error(errMsg);
		if (typeof errorCb === 'function') {
			errorCb(errMsg);
		}
	});
}

/**
 * 酷我小程序的搜索链接
 */
kuwoJs.kuwoSearchForMPWX = function(label, curPage, successCb, errorCb) {
	const request_url = URL_KUWO_SERACH_MPWX;
	const request_data = {
		key: label,
		pn: curPage,
		rn: 20
	};
	const request_method = "GET";
	const request_header = {};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === 0) {
			if (typeof successCb === 'function') {
				let songList = [];
				if (res.data.list.length > 0) {
					res.data.list.forEach((item, index) => {
						let songName = item.title;
						songName = songName.replaceAll('&nbsp;', ' ');
						songName = songName.replaceAll('&lt;em&gt;', '');
						songName = songName.replaceAll('&lt;/em&gt;', '');
						songName = songName.replaceAll('&apos;', '\'');
						let artist = item.artist;
						artist = artist.replaceAll('&nbsp;', ' ');
						artist = artist.replaceAll('&lt;em&gt;', '');
						artist = artist.replaceAll('&lt;/em&gt;', '');
						artist = artist.replaceAll('&apos;', '\'');
						let album = item.album;
						album = album.replaceAll('&nbsp;', ' ');
						album = album.replaceAll('&lt;em&gt;', '');
						album = album.replaceAll('&lt;/em&gt;', '');
						album = album.replaceAll('&apos;', '\'');
						songList.push({
							platform: 'kuwo',
							id: item.id,
							name: songName,
							url: '',
							singer: artist,
							albumName: album,
							albumUrl: item.pic,
							isFree: true,
							hasCache: false,
							localPath: '',
							duration: 0,
						})
					});
				}
				successCb(songList);
			}
		} else {
			console.error(res.errmsg === undefined ? res.msg : res.errmsg);
			if (typeof errorCb === 'function') {
				errorCb(res.errmsg === undefined ? res.msg : res.errmsg);
			}
		}
	}).catch((errMsg) => {
		console.error(errMsg);
		if (typeof errorCb === 'function') {
			errorCb(errMsg);
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
	}).catch((errMsg) => {
		console.error(errMsg);
		if (typeof errorCb === 'function') {
			errorCb(errMsg);
		}
	});
}

kuwoJs.kuwoSongInfo = function(songId, successCb, errorCb) {
	const request_url = URL_INFO_KUWO;
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
				let data = {
					lrclist: res.data.lrclist,
					img: res.data.songinfo.pic
				}
				successCb(data);
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.msg);
			}
		}
	}).catch((errMsg) => {
		console.error(errMsg);
		if (typeof errorCb === 'function') {
			errorCb(errMsg);
		}
	});
}

/**
 * 判断播放连接是否有效
 * 酷我的网络播放链接只有一个小时的播放时效，超过一个小时就会报410/403错误
 */
kuwoJs.isUrlValid = function(song) {
	const timeDiff = Date.now() - song.urlTime;
	return timeDiff < 1000 * 60 * 60 - song.duration * 1000;
}

export default kuwoJs;

import requester from "@/utils/request.js"
import forge from "@/utils/lib/index.js"


const BASE_URL_MIGU = "https://jadeite.migu.cn";
const URL_SEARCH_MIGU = "/music_search/v2/search/searchAll";
const URL_MP3_MIGU = "https://app.c.nf.migu.cn/MIGUM2.0/strategy/listen-url/v2.2";

let miguJs = {}

// app签名证书的md5, 应该是咪咕音乐安卓端的签名吧
const signature_md5 = '6cdc72a439cef99a3418d2a78aa28c73';

function uuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	uuid = uuid.split("-").join("");
	return uuid;
}

miguJs.miguSearch = function(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_MIGU + URL_SEARCH_MIGU;
	const sidStr = (uuid() + uuid()).replace(/-/g, '');
	const request_data = {
		isCorrect: 1,
		isCopyright: 1,
		searchSwitch: {
			"song": 1
		},
		pageSize: 20,
		text: label,
		pageNo: curPage,
		feature: 1000000000,
		sort: 1
	};

	const deviceId = forge.md5
		.create()
		.update(uuid().replace(/-/g, ''))
		.digest()
		.toHex()
		.toLocaleUpperCase(); // 设备的UUID
	const timestamp = new Date().getTime();
	const text = label + signature_md5 + 'yyapp2d16148780a1dcc7408e06336b98cfd50' + deviceId + timestamp;
	const sign = forge.md5.create().update(forge.util.encodeUtf8(text)).digest().toHex();

	const request_method = "GET";
	const request_header = {
		'uiVersion': 'A_music_3.3.0',
		'deviceId': deviceId,
		'timestamp': timestamp,
		'sign': sign
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === '000000') {
			if (typeof successCb === 'function') {
				let songList = [];
				res.songResultData.result.forEach((item, index) => {
					let lyric_Url = item.lyricUrl;
					lyric_Url = lyric_Url.replace('http:', 'https:');
					songList.push({
						platform: 'migu',
						id: item.id,
						name: item.name,
						quality: item.toneControl,
						url: '',
						singer: item.singer,
						albumName: item.album,
						albumUrl: item.albumImgs[0].img,
						lyricUrl: lyric_Url,
						hasCache: false,
						delete: false,
						savedFilePath:'',
						isFree: (typeof item.listenFlag === 'undefined' ||
								item.listenFlag == '4' ||
								item.listenFlag == '7') &&
							item.isInSalesPeriod != '1',
					})
				});
				successCb(songList);
			}
		} else {
			console.log(res.info != undefined ? res.info : res.errormsg);
			if (typeof errorCb === 'function') {
				errorCb(res.info != undefined ? res.info : res.errormsg);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

miguJs.miguSongUrl = function(songId, quality, successCb, errorCb) {
	const request_url = URL_MP3_MIGU;
	let tone;
	switch (quality) {
		case '110000':
			tone = 'HQ';
			break;
		case '111100':
			tone = 'SQ';
			break;
		case '111111':
			tone = 'ZQ';
			break;
		default:
			tone = 'PQ';
	}
	const request_data = {
		songId: songId,
		netType: '01',
		resourceType: 'E',
		toneFlag: tone
	};
	const request_method = "GET";
	const request_header = {
		'channel': '0146951',
		'uid': '1234'
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === '000000' && res.data.url != undefined && res.data.url != '') {
			if (typeof successCb === 'function') {
				successCb(res.data.url)
			}
		} else {
			if (typeof successCb === 'function') {
				errorCb('需要咪咕VIP或没有音源');
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

miguJs.miguSonglyric = function(lyricUrl, successCb, errorCb) {
	const request_url = lyricUrl;
	const request_data = {};
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
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

export default miguJs;

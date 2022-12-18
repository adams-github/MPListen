
import requester from "@/utils/request.js"
import forge from 'node-forge'

const BASE_URL_MIGU = "https://jadeite.migu.cn";
const URL_SEARCH_MIGU = "/music_search/v2/search/searchAll";

// app签名证书的md5, 应该是咪咕音乐安卓端的签名吧
const signature_md5 = '6cdc72a439cef99a3418d2a78aa28c73'; 

function uuid() {
	const temp_url = URL.createObjectURL(new Blob());
	const strTemp = temp_url.toString();
	URL.revokeObjectURL(temp_url);
	return strTemp.substr(strTemp.lastIndexOf('/') + 1);
}

export function miguSearch(label, curPage, successCb, errorCb) {
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
      .toLocaleUpperCase();// 设备的UUID
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
					songList.push({
						platform: 'migu',
						id: item.id,
						name: item.songName,
						url: '',
						singer: item.singer,
						albumName: item.album,
						albumUrl: item.albumImgs[0].img,
						albumId: item.albumId
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

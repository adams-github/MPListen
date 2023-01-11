import requester from "@/utils/request.js"
import forge from "@/utils/lib/index.js"

import polyfill from '@/utils/base64/base64.js';
const {
	btoa
} = polyfill;


const BASE_URL_NETEASE = "https://music.163.com";
const URL_SEARCH_NETEASE = "/api/search/pc";
const URL_MP3_NETEASE = "/eapi/song/enhance/player/url";
const URL_LYRIC_NETEASE = "/weapi/song/lyric";

let neteaseJs = {};

/**
 * 网易云的接口必须加上cookie，不然会返回-462的报错
 */
neteaseJs.neteaseSearch = function(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_NETEASE + URL_SEARCH_NETEASE;
	const request_data = {
		s: label,
		offset: 20 * (curPage - 1),
		limit: 20,
		type: '1',
	};
	const request_method = "POST";
	const request_header = {
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
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
				if (res.result.songs.length > 0) {
					res.result.songs.forEach((item, index) => {
						let singerName = '';
						item.artists.forEach((singer_name, idx) => {
							if (idx != 0) {
								singerName += '、';
							}
							singerName += singer_name.name;
						});
						songList.push({
							platform: 'netease',
							id: item.id,
							name: item.name,
							url: '',
							singer: singerName,
							albumName: item.album.name,
							albumUrl: item.album.picUrl,
							isFree: item.fee == 0 || item.fee == 8,
							hasCache: false,
							localPath: '',
							duration: 0,
						})
					});
				}
				successCb(songList);
			}
		} else if (res.code === -462) {
			errorCb(-462);
		} else {
			console.error(res.message == undefined ? res.msg : res.message);
			if (typeof errorCb === 'function') {
				errorCb(res.message == undefined ? res.msg : res.message);
			}
		}
	}).catch((error) => {
		console.error(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
};


function eapi(url, object) {
	const eapiKey = 'e82ckenh8dichen8';
	const text = typeof object === 'object' ? JSON.stringify(object) : object;
	const message = 'nobody' + url + 'use' + text + 'md5forencrypt';
	const digest = forge.md5
		.create()
		.update(forge.util.encodeUtf8(message))
		.digest()
		.toHex();
	const data = url + '-36cd479b6b5-' + text + '-36cd479b6b5-' + digest;

	return {
		params: aes_encrypt(data, eapiKey, 'AES-ECB').toHex().toUpperCase(),
	};
}

function aes_encrypt(text, sec_key, algo) {
	const cipher = forge.cipher.createCipher(algo, sec_key);
	cipher.start({
		iv: '0102030405060708'
	});
	cipher.update(forge.util.createBuffer(text));
	cipher.finish();

	return cipher.output;
}


/**
 * 通过歌曲的id来获取mp3的播放连接，大概率也是有播放期限限制的(路径带有日期)
 */
neteaseJs.neteaseSongUrl = function(songId, successCb, errorCb) {
	const request_url = BASE_URL_NETEASE + URL_MP3_NETEASE;
	const d = {
		ids: '[' + songId + ']',
		br: 999000
	};
	const request_data = eapi('/api/song/enhance/player/url', d);
	const request_method = "POST";
	const request_header = {
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === 200) {
			if (res.data[0].url != undefined && res.data[0].url != null && res.data[0].url != '') {
				if (typeof successCb === 'function') {
					successCb(res.data[0].url);
				}
			} else {
				if (typeof errorCb === 'function') {
					errorCb('需要网易VIP或没有音源');
				}
			}
		} else if (res.code === -462) {
			errorCb(-462);
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.message == undefined ? res.msg : res.message);
			}
		}
	}).catch((errMsg) => {
		console.error(errMsg);
		if (typeof errorCb === 'function') {
			errorCb(errMsg);
		}
	});
};


function weapi(text) {
	const modulus =
		'00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b72' +
		'5152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbd' +
		'a92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe48' +
		'75d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
	const nonce = '0CoJUm6Qyw8W8jud';
	const pubKey = '010001';
	text = JSON.stringify(text); // eslint-disable-line no-param-reassign
	const sec_key = create_secret_key(16);
	const enc_text = btoa(
		aes_encrypt(
			btoa(aes_encrypt(text, nonce, 'AES-CBC').data),
			sec_key,
			'AES-CBC'
		).data
	);
	const enc_sec_key = rsa_encrypt(sec_key, pubKey, modulus);
	const data = {
		params: enc_text,
		encSecKey: enc_sec_key,
	};

	return data;
}


function create_secret_key(size) {
	const result = [];
	const choice = '012345679abcdef'.split('');
	for (let i = 0; i < size; i += 1) {
		const index = Math.floor(Math.random() * choice.length);
		result.push(choice[index]);
	}
	return result.join('');
}

function rsa_encrypt(text, pubKey, modulus) {
	text = text.split('').reverse().join(''); // eslint-disable-line no-param-reassign
	const n = new forge.jsbn.BigInteger(modulus, 16);
	const e = new forge.jsbn.BigInteger(pubKey, 16);
	const b = new forge.jsbn.BigInteger(forge.util.bytesToHex(text), 16);
	const enc = b.modPow(e, n).toString(16).padStart(256, '0');
	return enc;
}

/**
 * 获取歌词
 */
neteaseJs.neteaseLyric = function(songId, successCb, errorCb) {
	const request_url = BASE_URL_NETEASE + URL_LYRIC_NETEASE;
	const d = {
		id: songId,
		lv: -1,
		tv: -1,
		csrf_token: '',
	};
	const request_data = weapi(d);
	const request_method = "POST";
	const request_header = {
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
	};

	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.code === 200) {
			if (typeof successCb === 'function') {
				successCb(res.lrc.lyric);
			}
		} else if (res.code === -462) {
			errorCb(-462);
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.message == undefined ? res.msg : res.message);
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
 * 网易的播放连接中带有有效截止时间的字段
 * 比如：http://m801.music.126.net/20230110171831/e6963ca45fa09b6b64d2fff54748b5a4/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/14096446930/78e1/6c03/760c/ea1c72d665ff8fc2753897e67105753b.mp3
 */
neteaseJs.isUrlValid = function(song) {
	const startIndex = song.url.indexOf('.net/') + 5;
	let cutOffTimeStr =  song.url.substring(startIndex, startIndex + 14);
	let year = cutOffTimeStr.substring(0, 4);
	let month = cutOffTimeStr.substring(4, 6);
	let day = cutOffTimeStr.substring(6, 8);
	let hour = cutOffTimeStr.substring(8, 10);
	let minite = cutOffTimeStr.substring(10, 12);
	let second = cutOffTimeStr.substring(12, 14);
	cutOffTimeStr = year + '/' + month + '/' + day + ' ' + hour + ':' + minite + ':' + second;
	const cutOffTime = Date.parse(cutOffTimeStr);//有效截止时间的时间戳
	return (Date.now() + song.duration * 1000) < cutOffTime;
}


export default neteaseJs;

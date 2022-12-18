import requester from "@/utils/request.js"
import forge from 'node-forge'

const BASE_URL_NETEASE = "https://music.163.com";
const URL_SEARCH_NETEASE = "/api/search/pc";
const URL_MP3_NETEASE = "/eapi/song/enhance/player/url";

let neteaseJs = {};



// function _create_secret_key(size) {
// 	const result = [];
// 	const choice = '012345679abcdef'.split('');
// 	for (let i = 0; i < size; i += 1) {
// 		const index = Math.floor(Math.random() * choice.length);
// 		result.push(choice[index]);
// 	}
// 	return result.join('');
// }

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
		'cookie': 'NMTID=00On-HgH9ZroRVOqkTOof-fqShT_IsAAAGFFkPB_Q'
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
				res.result.songs.forEach((item, index) => {
					songList.push({
						platform: 'netease',
						id: item.id,
						name: item.name,
						url: '',
						singer: item.artists[0].name,
						albumName: item.album.name,
						albumUrl: item.album.picUrl,
						albumId: item.album.id
					})
				});
				successCb(songList);
			}
		} else {
			console.log(res.message == undefined ? res.msg : res.message);
			if (typeof errorCb === 'function') {
				errorCb(res.message == undefined ? res.msg : res.message);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
};

neteaseJs.neteaseSongUrl = function(songId, successCb, errorCb) {
	const d = {
		ids: '[' + songId + ']',
		br: 999000
	};
	const request_url = BASE_URL_NETEASE + URL_MP3_NETEASE;
	const request_data = eapi('/api/song/enhance/player/url', d);//FA90B329E9614F79E79598F37DC2EDB430F8378D2A2796338F0BFDEAEF824A22975CDA9D96D79E6DC4A59218CDB8199FF0BF5508AC469039F9416CFBA9DCF26D4959DDD5294E9C48DBF5C8992F45F3D57F7CD65F22E85F6ABBD4A9C3DD63764B40996555D96920E0D801A2969EC832E1C70A769355061E5EE37D7A9E40F97FC2
	const request_method = "POST";
	const request_header = {
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
		'cookie': 'NMTID=00On-HgH9ZroRVOqkTOof-fqShT_IsAAAGFFkPB_Q'
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
				successCb(res.data[0].url);
			}
		} else {
			console.log(res.message == undefined ? res.msg : res.message);
			if (typeof errorCb === 'function') {
				errorCb(res.message == undefined ? res.msg : res.message);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
};


export default neteaseJs;

// /**
//  * 网易云的接口必须加上cookie，不然会返回-462的报错
//  */
// export function neteaseSearch(label, curPage, successCb, errorCb) {
// 	const request_url = BASE_URL_NETEASE + URL_SEARCH_NETEASE;
// 	const request_data = {
// 		s: label,
// 		offset: 20 * (curPage - 1),
// 		limit: 20,
// 		type: '1',
// 	};
// 	const request_method = "POST";
// 	const request_header = {
// 		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
// 		'cookie': 'NMTID=00On-HgH9ZroRVOqkTOof-fqShT_IsAAAGFFkPB_Q'
// 	};

// 	requester.request({
// 		request_url,
// 		request_data,
// 		request_method,
// 		request_header
// 	}).then((res) => {
// 		if (res.code === 200) {
// 			if (typeof successCb === 'function') {
// 				let songList = [];
// 				res.result.songs.forEach((item, index) => {
// 					songList.push({
// 						platform: 'netease',
// 						id: item.id,
// 						name: item.name,
// 						url: '',
// 						singer: item.artists[0].name,
// 						albumName: item.album.name,
// 						albumUrl: item.album.picUrl,
// 						albumId: item.album.id
// 					})
// 				});
// 				successCb(songList);
// 			}
// 		} else {
// 			console.log(res.message == undefined ? res.msg : res.message);
// 			if (typeof errorCb === 'function') {
// 				errorCb(res.message == undefined ? res.msg : res.message);
// 			}
// 		}
// 	}).catch((error) => {
// 		console.log(error);
// 		if (typeof errorCb === 'function') {
// 			errorCb(error);
// 		}
// 	});
// }

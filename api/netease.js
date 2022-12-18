import requester from "@/utils/request.js"

const BASE_URL_NETEASE = "https://music.163.com";
const URL_SEARCH_NETEASE = "/api/search/pc";


function _create_secret_key(size) {
	const result = [];
	const choice = '012345679abcdef'.split('');
	for (let i = 0; i < size; i += 1) {
		const index = Math.floor(Math.random() * choice.length);
		result.push(choice[index]);
	}
	return result.join('');
}

/**
 * 网易云的接口必须加上cookie，不然会返回-462的报错
 */
export async function neteaseSearch(label, curPage, successCb, errorCb) {
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
}

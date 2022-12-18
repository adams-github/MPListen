import requester from "@/utils/request.js"

const BASE_URL_KUGOU = "https://songsearch.kugou.com";
const URL_SEARCH_KUGOU = "/song_search_v2";

export function kugouSearch(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_KUGOU + URL_SEARCH_KUGOU;
	const request_data = {
		keyword: label,
		page: curPage,
	};
	const request_method = "GET";
	const request_header = {
		// 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
	};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.error_code === 0) {
			if (typeof successCb === 'function') {
				let songList = [];
				res.data.lists.forEach((item, index) => {
					songList.push({
						platform: 'kugou',
						id: item.FileHash,
						name: item.SongName,
						url: '',
						singer: item.Singers[0].name,
						albumName: item.AlbumName,
						albumUrl: '',
						albumId: item.AlbumID
					})
				});
				successCb(songList);
			}
		} else {
			console.log(res.error_msg);
			if (typeof errorCb === 'function') {
				errorCb(res.error_msg);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

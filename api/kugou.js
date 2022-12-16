import request from "@/utils/request.js"

const BASE_URL_KUGOU = "https://songsearch.kugou.com";
const URL_SEARCH = "/song_search_v2";

export function kugouSearch(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_KUGOU + URL_SEARCH;
	const request_data = {
		keyword: label,
		page: curPage,
	};
	const request_method = "GET";
	const request_header = {
		// 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
	};
	request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((data) => {
		console.log(data);
		if (data.error_code === 0) {
			if (typeof successCb === 'function') {
				let songList = [];
				data.data.lists.forEach((item, index)=>{
					songList.push({
						platform:'kugou',
						id: item.FileHash,
						name: item.SongName,
						url:'',
						singer: item.Singers[0].name,
						albumName: item.AlbumName,
						albumUrl:'',
						albumId:item.AlbumID
					})
				});
				successCb(songList);
			}
		} else {
			if (typeof errorCb === 'function') {
				console.log(data.error_msg);
				errorCb(data.error_msg);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}
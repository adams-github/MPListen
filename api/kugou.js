import requester from "@/utils/request.js"

const BASE_URL_KUGOU = "https://songsearch.kugou.com";
const URL_SEARCH_KUGOU = "/song_search_v2";
const URL_MP3_KUGOU = "https://wwwapi.kugou.com/yy/index.php";

let kugouJs = {};

kugouJs.kugouSearch = function(label, curPage, successCb, errorCb) {
	const request_url = BASE_URL_KUGOU + URL_SEARCH_KUGOU;
	const request_data = {
		keyword: label,
		page: curPage,
		platform: 'WebFilter'
	};
	const request_method = "GET";
	const request_header = {};
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

/**
 * 根据歌曲的id和专辑id来获取歌曲的信息，拿到播放的url(大概率有期限)，专辑图片url， 歌词
 */
kugouJs.kugouSongData = function(songId, albumId, successCb, errorCb) {
	const request_url = URL_MP3_KUGOU;
	const request_data = {
		r: 'play/getdata',
		mid: 1,
		hash: songId,
		platid: 4,
		album_id: albumId,
		_: new Date().getTime()
	};
	const request_method = "GET";
	const request_header = {};
	requester.request({
		request_url,
		request_data,
		request_method,
		request_header
	}).then((res) => {
		if (res.err_code === 0) {
			if (res.data.play_url != undefined && res.data.play_url != '') {
				if (typeof successCb === 'function') {
					successCb({
						url: res.data.play_url,
						img: res.data.img
					});
				}
			} else {
				if (typeof errorCb === 'function') {
					errorCb('酷狗没有版权或需要VIP');
				}
			}
		} else {
			console.log(res.err_msg);
			if (typeof errorCb === 'function') {
				errorCb(res.err_msg);
			}
		}
	}).catch((error) => {
		console.log(error);
		if (typeof errorCb === 'function') {
			errorCb(error);
		}
	});
}

export default kugouJs

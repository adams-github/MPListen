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
				if (res.data.lists.length > 0) {
					res.data.lists.forEach((item, index) => {
						let free = item.PayType != 2 && item.trans_param.cpy_attr0 == 0;
						let songId = item.FileHash;
						let songName = item.SongName;
						let AlbumID = item.AlbumID;
						let AlbumName = item.AlbumName;
						let singerName = item.SingerName;
						if (!free) {
							for (let i = 0; i < item.Grp.length; i++) {
								if (item.Grp[i].PayType != 2 && item.Grp[i].trans_param.cpy_attr0 ==
									0) {
									songId = item.Grp[i].FileHash;
									songName = item.Grp[i].SongName;
									AlbumID = item.Grp[i].AlbumID;
									AlbumName = item.Grp[i].AlbumName;
									singerName = item.Grp[i].SingerName;
									free = true;
									break;
								}
							}
						}
						songList.push({
							platform: 'kugou',
							id: songId,
							name: songName,
							url: '',
							singer: singerName,
							albumName: AlbumName,
							albumUrl: '',
							albumId: AlbumID,
							isFree: free,
							hasCache: false,
							localPath: '',
							duration: 0,
						})
					});
				}
				successCb(songList);
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.error_msg);
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
						img: res.data.img,
						lyrics: res.data.lyrics
					});
				}
			} else {
				if (typeof errorCb === 'function') {
					errorCb('需要酷狗VIP或没有音源');
				}
			}
		} else {
			if (typeof errorCb === 'function') {
				errorCb(res.err_msg);
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
 * 酷狗的播放链接貌似有效期是24小时
 * 另外酷狗的播放链接带有url的生成时间，这个生成时间可能会和url请求时间差几分钟
 * https://webfs.tx.kugou.com/202301102145/3d0dca83bde7a92a68a9f722bca2f555/v2/6451d57aa27f80b17bfa7735cf8df106/G169/M05/11/13/6Q0DAF1JJG6AGAfIAEC_bagk7Eo659.mp3
 * 
 */
kugouJs.isUrlValid = function(song) {
	const startIndex = song.url.indexOf('.com/') + 5;
	let createTimeStr =  song.url.substring(startIndex, startIndex + 12);
	let year = createTimeStr.substring(0, 4);
	let month = createTimeStr.substring(4, 6);
	let day = createTimeStr.substring(6, 8);
	let hour = createTimeStr.substring(8, 10);
	let minite = createTimeStr.substring(10, 12);
	createTimeStr = year + '/' + month + '/' + day + ' ' + hour + ':' + minite + ':' + '00';
	const createTime = Date.parse(createTimeStr);//有效截止时间的时间戳
	return (Date.now() + song.duration * 1000) < (createTime + 1000 * 60 * 60 * 24);
}

export default kugouJs;

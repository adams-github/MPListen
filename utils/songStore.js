import downloadJs from "@/utils/download.js"

let songStore = {};

const KEY_SONGLIST = "song_list";
const PLAY_MODE = "play_mode";
const CUR_INDEX = "cur_index";
const CUR_SONG = "cur_song";

var songList = []; //播放列表
var playMode; //播放模式， 0：单曲循环， 1：顺序播放，2：随机播放
var playingIndex = 0; //当前播放对应的index
var playingSong;


songStore.loadAllSongs = function(callback) {
	if (typeof songList === 'undefined' || songList == null || songList.length == 0) {
		uni.getStorage({
			key: KEY_SONGLIST,
			success: function(res) {
				songList = res.data;
			},
			complete:function(){
				if (typeof callback != 'undefined' && callback != null) {
					callback();
				}
			}
		});
	}
}

songStore.loadPlayingSong = function(callback) {
	uni.getStorage({
		key: CUR_SONG,
		success: function(res) {
			playingSong = res.data;
		},
		complete:function(){
			if (typeof callback != 'undefined' && callback != null) {
				callback();
			}
		}
	});
}


songStore.loadPlayingIndex = function() {
	uni.getStorage({
		key: CUR_INDEX,
		success: function(res) {
			playingIndex = res.data;
		}
	});
}


songStore.loadPlayMode = function() {
	uni.getStorage({
		key: PLAY_MODE,
		success: function(res) {
			playMode = res.data;
		},
		fail: function(res) {
			playMode = 1;
			uni.setStorage({
				key: PLAY_MODE,
				data: 1
			});
		}
	});
}


songStore.getPlayMode = function() {
	return playMode;
}

songStore.getSongList = function() {
	return songList;
}

songStore.getCurPlayingSong = function() {
	return playingSong;
}

songStore.getSongByIndex = function(index) {
	return songList[index];
}

songStore.getNextSong = function() {
	if (typeof songList === 'undefined' || songList == null || songList.length == 0) {
		return null;
	}
	if (playMode == 2) {
		//返回0 - songList.length - 1中的随机数
		playingIndex = Math.floor(Math.random() * songList.length);
		songStore.clickSong(playingIndex);
		return songList[playingIndex];
	} else {
		let index = playingIndex + 1;
		if (index >= songList.length) {
			index = 0;
		}
		songStore.clickSong(index);
		return songList[index];
	}
}

songStore.getPreSong = function() {
	if (typeof songList === 'undefined' || songList == null || songList.length == 0) {
		return null;
	}

	if (playMode == 2) {
		playingIndex = Math.floor(Math.random() * songList.length);
		songStore.clickSong(playingIndex);
		return songList[playingIndex];
	} else {
		let index = playingIndex - 1;
		if (index < 0) {
			index = songList.length - 1;
		}
		songStore.clickSong(index);
		return songList[index];
	}
}



/**
 * 记录歌曲信息
 */
songStore.recordSong = function(song) {
	if (typeof songList === 'undefined' || songList == null) {
		songList = [];
	}
	const index = songList.findIndex((ele) => ele.id === song.id);
	if (index < 0) {
		//先限制保存500首歌
		if (songList.length >= 500) {
			const popSong = songList.pop();
		}
		songList.unshift(song);
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList
		});
		playingIndex = 0;
	} else {
		playingIndex = index;
		song.duration = songList[playingIndex].duration;
		songList[playingIndex] = song;
	}
	uni.setStorage({
		key: KEY_SONGLIST,
		data: songList
	});
	uni.setStorage({
		key: CUR_INDEX,
		data: playingIndex
	});

	playingSong = song;
	uni.setStorage({
		key: CUR_SONG,
		data: playingSong
	});
}


/**
 * 删掉歌曲的记录
 */
songStore.removeSong = function(index) {
	const song = songList[index];
	songList.splice(index, 1);
	uni.setStorage({
		key: KEY_SONGLIST,
		data: songList
	});
	if (index <= playingIndex) {
		playingIndex--;
		uni.setStorage({
			key: CUR_INDEX,
			data: playingIndex
		});
	} else if (playingIndex >= songList.length) {
		playingIndex = 0;
		uni.setStorage({
			key: CUR_INDEX,
			data: playingIndex
		});
	}

	if (song.id === playingSong.id) {
		playingSong.hasCache = false;
		playingSong.localPath = '';
		uni.setStorage({
			key: CUR_SONG,
			data: playingSong
		});
	}
}


/**
 * 缓存音乐到本地
 * 下载后的音乐文件会存储到一个临时文件
 * 随时会被回收。运行时最多存储 4GB，结束运行后，如果已使用超过 2GB，会以文件为维度按照最近使用时间从远到近进行清理至少于2GB
 */
songStore.cacheSong = function(song) {
	if (song.platform != 'kuwo' && !song.hasCache) {
		downloadJs.dowloadSong(song.id, song.url, (res) => {
			const fingSong = songList.find((ele) => ele.id === res.id);
			if (typeof findSong != 'undefined' && findSong != null) {
				fingSong.hasCache = true;
				fingSong.localPath = res.path;
				uni.setStorage({
					key: KEY_SONGLIST,
					data: songList
				});
			}
			if (res.id === playingSong.id) {
				playingSong.hasCache = true;
				playingSong.localPath = res.path;
				uni.setStorage({
					key: CUR_SONG,
					data: playingSong
				});
			}
		}, (error) => {});
	}
}


/**
 * 歌曲下载后都是存到临时文件路径，随时会被回收的文件。
 * 结束运行后，如果已使用超过 2GB，会以文件为维度按照最近使用时间从远到近进行清理至少于2GB
 * 所以不需要手动去清除文件，只需要做个记录就可以了
 */
songStore.removeFile = function(song) {
	if (song.hasCache) {
		song.hasCache = false;
		song.localPath = '';
	}
}

/**
 * 更新歌曲的播放总时长
 */
songStore.updateDuration = function(songId, duration) {
	const findSong = songList.find((ele) => ele.id === songId);
	if (typeof findSong != 'undefined' && findSong != null) {
		findSong.duration = duration;
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList
		});
	}

	if (songId === playingSong.id) {
		playingSong.duration = duration;
		uni.setStorage({
			key: CUR_SONG,
			data: playingSong
		});
	}
}


/**
 * 更新播放url
 */
songStore.updateUrl = function(songId, newUrl) {
	const findSong = songList.find((ele) => ele.id === songId);
	if (typeof findSong != 'undefined' && findSong != null) {
		findSong.url = newUrl;
		findSong.urlTime = Date.now();
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList
		});
	}

	if (songId === playingSong.id) {
		playingSong.url = newUrl;
		playingSong.urlTime = Date.now();
		uni.setStorage({
			key: CUR_SONG,
			data: playingSong
		});
	}
}

/**
 * 更新url的访问时间
 */
songStore.updateVisitTime = function(songId) {
	const findSong = songList.find((ele) => ele.id === songId);
	if (typeof findSong != 'undefined' && findSong != null) {
		findSong.urlTime = Date.now();
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList
		});
	}

	if (songId === playingSong.id) {
		playingSong.urlTime = Date.now();
		uni.setStorage({
			key: CUR_SONG,
			data: playingSong
		});
	}
}

/**
 * 记录当前播放到哪一首歌的index
 */
songStore.clickSong = function(index) {
	playingSong = songList[index];
	uni.setStorage({
		key: CUR_SONG,
		data: playingSong
	});

	if (index == playingIndex) return;
	playingIndex = index;
	uni.setStorage({
		key: CUR_INDEX,
		data: playingIndex
	});
}

songStore.changePlayMode = function(val) {
	playMode = val;
	uni.setStorage({
		key: PLAY_MODE,
		data: playMode
	})
}




export default songStore;

import downloadJs from "@/utils/download.js"

let songStore = {};

const KEY_SONGLIST = "song_list";
const PLAY_MODE = "play_mode";
const CUR_INDEX = "cur_index";
const CUR_SONG = "cur_song";

let songList = []; //播放列表
let playMode; //播放模式， 0：单曲循环， 1：顺序播放，2：随机播放
let playingIndex = 0; //当前播放对应的index
let playingSong;


songStore.loadAllSongs = function() {
	if (typeof songList === 'undefined' || songList == null || songList.length == 0) {
		uni.getStorage({
			key: KEY_SONGLIST,
			success: function(res) {
				songList = res.data;
				if (typeof songList === 'undefined' || songList == null) {
					songList = [];
				}
			}
		});
	}
}

songStore.loadPlayingIndex = function() {
	uni.getStorage({
		key: CUR_INDEX,
		success: function(res) {
			playingIndex = res.data;
		}
	});
}

songStore.loadPlayingSong = function() {
	uni.getStorage({
		key: CUR_SONG,
		success: function(res) {
			playingSong = res.data;
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

songStore.getSongList = function() {
	return songList;
}

songStore.getCurPlayingSong = function() {
	return playingSong;
}

songStore.getPlayMode = function() {
	return playMode;
}

songStore.addSong = function(song) {
	if (typeof songList === 'undefined' || songList == null) {
		songList = [];
	}
	const index = songList.findIndex((ele) => ele.id === song.id);
	if (index < 0) {
		if (songList.length >= 500) {
			const popSong = songList.pop();
			/**
			 * 判断文件是不是已经缓存
			 */
			if (popSong.hasCache) {
				popSong.hasCache = false;
				popSong.delete = true;
				uni.getFileSystemManager().removeSavedFile({
					filePath: popSong.savedFilePath,
					fail: function(error) {
						console.error('removeFail:' + error.errMsg);
					},
				});
			}
		}
		song.delete = false;
		songList.unshift(song);
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList
		});
		playingIndex = 0;
	} else {
		playingIndex = index;
	}
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

songStore.removeSong = function(index) {
	const song = songList[index];
	songList.splice(index, 1);
	uni.setStorage({
		key: KEY_SONGLIST,
		data: songList
	});
	if (index < playingIndex) {
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

	songStore.removeFile(song);

	if (song.id === playingSong.id) {
		playingSong.hasCache = false;
		playingSong.delete = true;
		playingSong.savedFilePath = '';
		uni.setStorage({
			key: CUR_SONG,
			data: playingSong
		});
	}
}

songStore.removeFile = function(song) {
	/**
	 * 判断文件是不是已经缓存
	 */
	if (song.hasCache) {
		song.hasCache = false;
		song.delete = true;
		uni.getFileSystemManager().removeSavedFile({
			filePath: song.savedFilePath,
			success: function() {
				song.savedFilePath = '';
			},
			fail: function(error) {
				console.error('removeFail:' + error.errMsg);
			},
		});
	}
}

songStore.cacheSong = function(song) {
	/**
	 * 缓存音乐到本地
	 */
	if (song.platform != 'kuwo' && !song.hasCache) {
		downloadJs.cacheSong(song.id, song.url, (res) => {
			const index = songList.findIndex((ele) => ele.id === res.id);
			songList[index].hasCache = true;
			songList[index].savedFilePath = res.path;
			songList[index].url = '';
			uni.setStorage({
				key: KEY_SONGLIST,
				data: songList
			});
			if (res.id === playingSong.id) {
				playingSong.hasCache = true;
				playingSong.savedFilePath = res.path;
				playingSong.url = '';
				uni.setStorage({
					key: CUR_SONG,
					data: playingSong
				});
			}
		}, (error) => {
			const index = songList.findIndex((ele) => ele.id === song.id);
			songList[index].url = '';
			uni.setStorage({
				key: KEY_SONGLIST,
				data: songList
			});
			if (song.id === playingSong.id) {
				playingSong.url = '';
				uni.setStorage({
					key: CUR_SONG,
					data: playingSong
				});
			}
		});
	}
}

/**
 * 更新酷我平台歌曲的播放url
 */
songStore.updateUrl = function(songId, newUrl) {
	const index = songList.findIndex((ele) => ele.id === songId);
	if (index >= 0 && index < songList.length && songList[index].platform == 'kuwo') {
		songList[index].url = newUrl;
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList
		});
	}

	if (songId === playingSong.id && playingSong.platform == 'kuwo') {
		playingSong.url = newUrl;
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

songStore.getNextSong = function() {
	if (typeof songList === 'undefined' || songList == null) {
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
	if (typeof songList === 'undefined' || songList == null) {
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

songStore.getSongByIndex = function(index) {
	return songList[index];
}


export default songStore;

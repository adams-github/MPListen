const KEY_SONGLIST = "song_list";
const PLAY_MODE = "play_mode";
const CUR_INDEX = "cur_index";
const RANDOM_INDEX = "random_index";

let songStore = {};

let songList = []; //播放列表
let playMode; //播放模式， 0：单曲循环， 1：顺序播放，2：随机播放
let playingIndex = 0; //当前播放对应的index
let randomIndex = -1;


songStore.loadAllSongs = function() {
	if (typeof songList === 'undefined' || songList == null || songList.length == 0) {
		uni.getStorage({
			key: KEY_SONGLIST,
			success: function(res) {
				songList = res.data;
				if (typeof songList === 'undefined' || songList == null) {
					songList = [];
				}
				console.log("loadAllSongs.success: ");
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

songStore.loadRandomIndex = function() {
	uni.getStorage({
		key: RANDOM_INDEX,
		success: function(res) {
			randomIndex = res.data;
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
	if (playMode == 2) {
		return songList[randomIndex];
	} else {
		return songList[playingIndex];
	}

}

songStore.getPlayMode = function() {
	return playMode;
}

songStore.addSong = function(song) {
	if (typeof songList === 'undefined' || songList == null) {
		songList = [];
	}
	const item = songList.find(item => item.id === song.id && item.platform == song.platform)
	if (typeof item === 'undefined' || item == null) {
		if (songList.length >= 500) {
			songList.pop();
		}
		songList.unshift(song);
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList,
			success: function() {
				console.log('addSong.success');
			}
		});
		playingIndex = 0;
	} else {
		const index = songList.findIndex((ele) => ele.id === song.id && ele.platform == song.platform);
		if (index >= 0) {
			playingIndex = index;
		}
	}

	uni.setStorage({
		key: CUR_INDEX,
		data: playingIndex
	});
}

songStore.removeSong = function(index) {
	songList.splice(index, 1);
	uni.setStorage({
		key: KEY_SONGLIST,
		data: songList,
		success: function() {
			console.log('removeSong.success');
		}
	});
	if (index < playingIndex) {
		playingIndex--;
		uni.setStorage({
			key: CUR_INDEX,
			data: playingIndex
		});
	} else if (playingIndex >= songList.length) {
		nextPlayIndex = 0;
		uni.setStorage({
			key: CUR_INDEX,
			data: playingIndex
		});
	}
}

songStore.updateUrl = function(newUrl) {
	if (songList[playingIndex].id == curPlayingSong.url && songList[playingIndex].platform == curPlayingSong
		.platform) {
		songList[playingIndex].url = newUrl;
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList,
			success: function() {
				console.log('updateUrl.success');
			}
		});
	}
}

/**
 * 记录当前播放到哪一首歌的index
 */
songStore.clickSong = function(index) {
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
		data: playMode,
		success: function() {
			console.log('changePlayMode.success');
		}
	})
}

songStore.getNextSong = function() {
	if (typeof songList === 'undefined' || songList == null) {
		return null;
	}
	if (playMode == 2) {
		//返回0 - songList.length - 1中的随机数
		randomIndex = Math.floor(Math.random() * songList.length);
		uni.setStorage({
			key: RANDOM_INDEX,
			data: randomIndex
		})
		return songList[randomIndex];
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
		randomIndex = Math.floor(Math.random() * songList.length);
		uni.setStorage({
			key: RANDOM_INDEX,
			data: randomIndex
		})
		return songList[randomIndex];
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

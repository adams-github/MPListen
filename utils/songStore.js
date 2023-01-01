const KEY_SONGLIST = "song_list";
const PLAY_MODE = "play_mode";
const CUR_SONG = "cur_song";
const LAST_SONG = "last_song";
const NEXT_INDEX = "next_index";


let songStore = {};

let songList = []; //播放列表
let playMode; //播放模式， 0：单曲循环， 1：顺序播放，2：随机播放
let lastSong; //上一首歌
let curPlayingSong;
let nextPlayIndex; //下一首要播放的歌的下标


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

songStore.loadCurPlaySong = function() {
	uni.getStorage({
		key: CUR_SONG,
		success: function(res) {
			curPlayingSong = res.data;
		}
	});
}

songStore.loadLastSong = function() {
	uni.getStorage({
		key: LAST_SONG,
		success: function(res) {
			lastSong = res.data;
		}
	});
}

songStore.loadNextIndex = function() {
	uni.getStorage({
		key: NEXT_INDEX,
		success: function(res) {
			nextPlayIndex = res.data;
		}
	});
}

songStore.getSongList = function() {
	return songList;
}

songStore.getCurPlayingSong = function() {
	return curPlayingSong;
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
		if (songList.length == 1) {
			nextPlayIndex = 0;
		} else {
			nextPlayIndex++;
		}
	} else {
		const index = songList.findIndex((ele) => ele.id === song.id && ele.platform == song.platform);
		const songArr = songList.splice(index, 1);
		songList.unshift(songArr[0]);
		nextPlayIndex = index + 1;
		if (nextPlayIndex >= songList.length) {
			nextPlayIndex = songList.length > 1 ? 1 : 0;
		}
	}

	if (typeof curPlayingSong != 'undefined' && curPlayingSong != null) {
		if (song.id != curPlayingSong.id || song.platform != curPlayingSong.platform) {
			lastSong = curPlayingSong;
			curPlayingSong = song;
		}
	} else {
		curPlayingSong = song;
	}

	uni.setStorage({
		key: KEY_SONGLIST,
		data: songList,
		success: function() {
			console.log('addSong.success');
		}
	});
	uni.setStorage({
		key: CUR_SONG,
		data: song
	});
	uni.setStorage({
		key: NEXT_INDEX,
		data: nextPlayIndex
	});

	if (typeof lastSong != 'undefined' && lastSong != null) {
		uni.setStorage({
			key: LAST_SONG,
			data: lastSong
		});
	}
}

songStore.removeSong = function(index) {
	songList.splice(index, 1);
	if (index < nextPlayIndex) {
		nextPlayIndex--;
		uni.setStorage({
			key: NEXT_INDEX,
			data: nextPlayIndex
		});
	}
	if (nextPlayIndex >= songList.length) {
		nextPlayIndex = songList.length > 1 ? 1 : 0;
		uni.setStorage({
			key: NEXT_INDEX,
			data: nextPlayIndex
		});
	}
	uni.setStorage({
		key: KEY_SONGLIST,
		data: songList,
		success: function() {
			console.log('addSong.success');
		}
	});
}

songStore.clickSong = function(index) {
	if (index == 0) return;

	lastSong = curPlayingSong;
	uni.setStorage({
		key: LAST_SONG,
		data: lastSong
	});

	if (playMode == 1) {
		nextPlayIndex = index + 1;
		if (nextPlayIndex >= songList.length) {
			nextPlayIndex = songList.length > 1 ? 1 : 0;
		}
		uni.setStorage({
			key: NEXT_INDEX,
			data: nextPlayIndex
		});
	}

	/**
	 * 移动到点击的歌到播放列表的第一位
	 */
	const songArr = songList.splice(index, 1);
	curPlayingSong = songArr[0];
	songList.unshift(curPlayingSong);
	uni.setStorage({
		key: CUR_SONG,
		data: curPlayingSong
	});
	uni.setStorage({
		key: KEY_SONGLIST,
		data: songList,
		success: function() {
			console.log('addSong.success');
		}
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
		//返回2 - songList.length中的随机数
		const index = Math.floor(Math.random() * songList.length + 2);
		songStore.clickSong(index);
		return curPlayingSong;
	} else if (playMode == 1) {
		songStore.clickSong(nextPlayIndex);
		return curPlayingSong;
	} else {
		return curPlayingSong;
	}

}

songStore.getPreSong = function() {
	if (typeof lastSong != 'undefined' && lastSong != null) {
		const index = songList.findIndex((ele) => ele.id === lastSong.id && ele.platform == lastSong.platform);
		const songArr = songList.splice(index, 1);
		songList.unshift(songArr[0]);
		uni.setStorage({
			key: KEY_SONGLIST,
			data: songList,
			success: function() {
				console.log('addSong.success');
			}
		});
		curPlayingSong = lastSong;
		uni.setStorage({
			key: CUR_SONG,
			data: curPlayingSong
		});
		lastSong = songList[Math.min((index + 1), (songList.length - 1))];
		uni.setStorage({
			key: LAST_SONG,
			data: lastSong
		});
		return curPlayingSong;
	} else {
		return songStore.getNextSong();
	}
}

songStore.getSongByIndex = function(index){
	return songList[index];
}


export default songStore;

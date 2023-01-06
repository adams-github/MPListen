import songStore from '@/utils/songStore.js'
import qqJs from '@/api/qq.js'
import kugouJs from '@/api/kugou.js'
import kuwoJs from '@/api/kuwo.js'
import neteaseJs from '@/api/netease.js'
import miguJs from '@/api/migu.js'

// 全局音频播放管理
let bgPlayer = {};
let isInited = false;
let curPlayingSong;
let playSeek = 0; //播放进度，单位s
let errorTime = 0; //播放出错次数
let isPlaying = false;

/**
 * 重新获取播放链接
 */
function updatePlayUrl() {
	const songId = curPlayingSong.id;
	switch (curPlayingSong.platform) {
		case 'netease':
			neteaseJs.neteaseSongUrl(songId, (data) => {
				requestSongUrlSuccess(songId, 'netease', data);
			}, (error) => {
				requestSongUrlFailed(error);
			});
			break;
		case 'kuwo':
			kuwoJs.kuwoSongUrl(songId, (data) => {
				requestSongUrlSuccess(songId, 'kuwo', data);
			}, (error) => {
				requestSongUrlFailed(error);
			});
			break;
		case 'qq':
			qqJs.qqSongUrl(songId, (data) => {
				requestSongUrlSuccess(songId, 'qq', data);
			}, (error) => {
				requestSongUrlFailed(error);
			})
			break;
		case 'kugou':
			kugouJs.kugouSongData(songId, curPlayingSong.albumId, (data) => {
				requestSongUrlSuccess(songId, 'kugou', data.url);
			}, (error) => {
				requestSongUrlFailed(error);
			});
			break;
		case 'migu':
			miguJs.miguSongUrl(songId, (data) => {
				requestSongUrlSuccess(songId, 'migu', data);
			}, (error) => {
				requestSongUrlFailed(error);
			});
			break;
	}
}

function requestSongUrlSuccess(songId, platform, newUrl) {
	if (songId === curPlayingSong.id) {
		getBpManager().title = curPlayingSong.name;
		getBpManager().singer = curPlayingSong.singer;
		getBpManager().coverImgUrl = curPlayingSong.albumUrl;
		getBpManager().startTime = playSeek;
		getBpManager().src = newUrl;
	}

	if (platform == 'kuwo') {
		songStore.updateUrl(songId, newUrl);
	} else {
		//重新缓存songId对应的歌曲
		if (curPlayingSong.id === songId) {
			curPlayingSong.url = newUrl;
			curPlayingSong.hasCache = false;
			songStore.cacheSong(curPlayingSong);
		} else {
			const songList = songStore.getSongList();
			const findSong = songList.find((ele) => ele.id === songId);
			if (typeof findSong != 'undefined' && findSong != null) {
				findSong.url = newUrl;
				findSong.hasCache = false;
				songStore.cacheSong(findSong);
			}
		}
	}
}

function requestSongUrlFailed(error) {
	uni.showToast({
		title: error,
		icon: 'none',
		position: 'bottom'
	});
	bgPlayer.stop();
}

function getBpManager() {
	if (!isInited) {
		isInited = true;
		uni.getBackgroundAudioManager().onError((res) => {
			console.error(res);
			isPlaying = false;
			uni.getBackgroundAudioManager().stop();
			if (errorTime == 0) {
				if (curPlayingSong.hasCache) {
					songStore.removeFile(curPlayingSong);
				}
				//这时候播放连接已经失效，需要重新获取
				updatePlayUrl();
			} else {
				uni.showToast({
					title: res.errMsg,
					icon: 'none',
					position: 'bottom'
				});
			}
			errorTime++;
		});
		uni.getBackgroundAudioManager().onEnded(() => {
			isPlaying = false;
			if (songStore.getPlayMode() == 0) {
				bgPlayer.play(curPlayingSong);
			} else {
				bgPlayer.playNext();
			}
		});
		uni.getBackgroundAudioManager().onTimeUpdate((res) => {
			playSeek = uni.getBackgroundAudioManager().currentTime;
		});
		uni.getBackgroundAudioManager().onPrev((res) => {
			bgPlayer.playPre();
		});
		uni.getBackgroundAudioManager().onNext((res) => {
			bgPlayer.playNext();
		});
	}
	return uni.getBackgroundAudioManager();
}

/**
 * 获取播放状态，true 表示暂停或停止，false 表示正在播放
 */
bgPlayer.isPlaying = function() {
	return !getBpManager().paused && isPlaying && typeof getBpManager().src != 'undefined' &&
		getBpManager().src != null && getBpManager().src != '';
}

/**
 * 当前当前音频的长度（单位：s）
 */
bgPlayer.getPlayingDuration = function() {
	return getBpManager().duration;
}

/**
 * 当前音频的播放位置（单位：s）
 */
bgPlayer.getPlayingCurTime = function() {
	return getBpManager().currentTime;
}


/**
 * 由于酷我平台的音乐无法下载，都是通过网络链接在线播放
 * 酷我的网络播放链接只有一个小时的播放时效，超过一个小时就会报410/403错误
 */
bgPlayer.play = function(song) {
	//判断是不是正在播放同一个首歌
	if (bgPlayer.isPlaying() && typeof curPlayingSong != 'undefined' &&
		curPlayingSong != null &&
		curPlayingSong.id === song.id) {
		getBpManager().stop();
	}
	curPlayingSong = song;
	playSeek = 0;
	errorTime = 0;
	isPlaying = false;

	getBpManager().title = song.name;
	getBpManager().singer = song.singer;
	getBpManager().coverImgUrl = song.albumUrl;

	if (song.hasCache && !song.delete) {
		//判断文件/目录是否存在
		uni.getFileSystemManager().access({
			path: song.savedFilePath,
			success(res) {
				getBpManager().src = song.savedFilePath;
			},
			fail(error) {
				// 文件不存在或其他错误
				console.error(error);
				updatePlayUrl();
			}
		})
	} else {
		if (song.platform != 'kuwo' || (Date.now() - song.urlTime) < 1000 * 60 * 54) {
			getBpManager().src = song.url; //设置连接后会自动开始播放
			if (song.platform != 'kuwo' && !song.delete) {
				songStore.cacheSong(song);
			}
		} else {
			updatePlayUrl(); //url为空，重新获取url
		}
	}

}

bgPlayer.replay = function() {
	errorTime = 0;
	if (typeof getBpManager().src === 'undefined' || getBpManager().src == null || getBpManager().src == '') {
		const song = songStore.getCurPlayingSong();
		if (song != null) {
			bgPlayer.play(song);
		}
	} else {
		if (curPlayingSong.platform == 'kuwo' && (Date.now() - curPlayingSong.urlTime) > 1000 * 60 * 54) {
			updatePlayUrl();
		} else {
			getBpManager().play();
		}
	}
}

bgPlayer.pause = function() {
	getBpManager().pause();
	isPlaying = false;
}

bgPlayer.stop = function() {
	getBpManager().stop();
	isPlaying = false;
}

bgPlayer.playPre = function() {
	const preSong = songStore.getPreSong();
	if (typeof preSong != 'undefined' && preSong != null) {
		bgPlayer.play(preSong);
	} else {
		bgPlayer.stop();
		isPlaying = false;
	}
}

bgPlayer.playNext = function() {
	const nextSong = songStore.getNextSong();
	if (typeof nextSong != 'undefined' && nextSong != null) {
		bgPlayer.play(nextSong);
	} else {
		bgPlayer.stop();
		isPlaying = false;
	}
}

/**
 * 跳转到指定位置，单位 s
 */
bgPlayer.seekTo = function(pos) {
	getBpManager().seek(pos);
}

/**
 * 背景音频进入可以播放状态，但不保证后面可以流畅播放
 */
bgPlayer.setOnCanPlay = function(onCanPlayCb) {
	getBpManager().onCanplay(() => {
		isPlaying = true;
		if (typeof onCanPlayCb === 'function') {
			onCanPlayCb();
		}
	});
}


/**
 * 背景音频自然播放结束事件
 */
bgPlayer.setOnEnded = function(endedCb) {
	getBpManager().onEnded(() => {
		isPlaying = false;
		if (songStore.getPlayMode() == 0) {
			bgPlayer.play(curPlayingSong);
		} else {
			bgPlayer.playNext();
		}
		if (typeof endedCb === 'function') {
			endedCb();
		}
	});
}

bgPlayer.setOnStoped = function(stopedCb) {
	getBpManager().onStop(() => {
		isPlaying = false;
		if (typeof stopedCb === 'function') {
			stopedCb();
		}
	});
}

bgPlayer.setOnPaused = function(pausedCb) {
	getBpManager().onPause(() => {
		isPlaying = false;
		if (typeof pausedCb === 'function') {
			pausedCb();
		}
	});
}

bgPlayer.setOnPlayed = function(playedCb) {
	getBpManager().onPlay(() => {
		isPlaying = true;
		if (typeof playedCb === 'function') {
			playedCb();
		}
	});
}

bgPlayer.setOnPred = function(preCb) {
	getBpManager().onPrev(() => {
		if (typeof preCb === 'function') {
			preCb();
		}
		bgPlayer.playPre();
	});
}

bgPlayer.setOnNexted = function(nextCb) {
	getBpManager().onNext(() => {
		if (typeof nextCb === 'function') {
			nextCb();
		}
		bgPlayer.playNext();
	});
}

/**
 * 背景音频播放进度更新事件
 */
bgPlayer.setTimeUpdate = function(updateCb) {
	getBpManager().onTimeUpdate(() => {
		playSeek = getBpManager().currentTime;
		if (typeof updateCb === 'function') {
			updateCb(playSeek);
		}
	});
}


/**
 * 音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
 */
bgPlayer.setOnWaiting = function(waittingCb) {
	if (typeof waittingCb === 'function') {
		getBpManager().onWaiting(() => {
			waittingCb();
		});
	}
}

export default bgPlayer;

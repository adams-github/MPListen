import songStore from '@/utils/songStore.js'
import qqJs from '@/api/qq.js'
import kugouJs from '@/api/kugou.js'
import kuwoJs from '@/api/kuwo.js'
import neteaseJs from '@/api/netease.js'
import miguJs from '@/api/migu.js'

// 全局音频播放管理
var bgPlayer = {};
var isInited = false;
var curPlayingSong = songStore.getCurPlayingSong();
var playSeek = 0; //播放进度，单位s
var errorTime = 0; //播放出错次数
var isPlaying = false;
var onSongChangeCallback;

/**
 * 获取播放器， 并且在第一次获取时对播放器设置一些回调
 */
function getBpManager() {
	if (!isInited) {
		isInited = true;
		uni.getBackgroundAudioManager().onError((res) => {
			onPlayError(res);
		});
		uni.getBackgroundAudioManager().onEnded(() => {
			isPlaying = false;
			if (songStore.getPlayMode() == 0) {
				bgPlayer.playSong(curPlayingSong);
			} else {
				bgPlayer.playNext();
			}
		});
		uni.getBackgroundAudioManager().onTimeUpdate((res) => {
			if (!isNaN(uni.getBackgroundAudioManager().currentTime)) {
				playSeek = uni.getBackgroundAudioManager().currentTime;
			}
		});
		uni.getBackgroundAudioManager().onPrev((res) => {
			bgPlayer.playPre();
		});
		uni.getBackgroundAudioManager().onNext((res) => {
			bgPlayer.playNext();
		});
		uni.getBackgroundAudioManager().onCanplay((res) => {
			if (curPlayingSong.duration != uni.getBackgroundAudioManager().duration) {
				let duration = uni.getBackgroundAudioManager().duration;
				if (!isNaN(duration) && duration > 0) {
					curPlayingSong.duration = duration;
					songStore.updateDuration(curPlayingSong.id, duration);
				}
			}
		});
	}
	return uni.getBackgroundAudioManager();
}

function onPlayError(res) {
	console.error(res);
	bgPlayer.stop();
	if (errorTime <= 1) {
		//播放失败直接重新获取url
		updatePlayUrl();
	} else {
		uni.showToast({
			title: res.errMsg,
			icon: 'none',
			position: 'bottom'
		});
	}
	errorTime++;
}

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
	songStore.updateUrl(songId, newUrl);
}

function requestSongUrlFailed(error) {
	uni.showToast({
		title: error,
		icon: 'none',
		position: 'bottom'
	});
	bgPlayer.stop();
}


/**
 * 校验各个平台播放url是否在有效时间内
 */
function isUrlVaild(song) {
	switch (song.platform) {
		case 'netease':
			return neteaseJs.isUrlValid(song);
		case 'kuwo':
			return kuwoJs.isUrlValid(song);
		case 'qq':
			return qqJs.isUrlValid(song);
		case 'kugou':
			return kugouJs.isUrlValid(song);
		case 'migu':
			return miguJs.isUrlValid(song);
	}
}

/**
 * 获取播放状态，true 表示暂停或停止，false 表示正在播放
 */
bgPlayer.isPlaying = function() {
	return !getBpManager().paused && isPlaying && getBpManager().src != '';
}

/**
 * 当前当前音频的长度（单位：s）
 */
bgPlayer.getPlayingDuration = function() {
	if (isNaN(getBpManager().duration)) {
		return 0;
	}
	return getBpManager().duration;
}

/**
 * 当前音频的播放位置（单位：s）
 */
bgPlayer.getPlayingCurTime = function() {
	if (isNaN(getBpManager().currentTime)) {
		return 0;
	}
	return getBpManager().currentTime;
}


/**
 * 播放歌曲
 */
bgPlayer.playSong = function(song) {
	//判断是不是正在播放同一个首歌
	if (typeof curPlayingSong === 'undefined' || curPlayingSong == null || curPlayingSong.id != song.id) {
		curPlayingSong = song;
		playSeek = 0;
		if (typeof onSongChangeCallback != 'undefined' && onSongChangeCallback != null) {
			onSongChangeCallback();
		}
	} else if (bgPlayer.isPlaying()) {
		return;
	}
	errorTime = 0;
	isPlaying = true;

	getBpManager().title = song.name;
	getBpManager().singer = song.singer;
	//微信小程序背景音频播放有bug, 不管怎么切换歌曲，开始时间都固定在一个秒数，
	//尝试一下设置0，看下后续还会不会出现这个问题
	getBpManager().startTime = 0;
	getBpManager().coverImgUrl = song.albumUrl;

	if (isUrlVaild(song)) {
		getBpManager().src = song.url; //设置连接后会自动开始播放
	} else {
		updatePlayUrl();
	}
}

bgPlayer.replay = function() {
	errorTime = 0;
	if (getBpManager().src == null || getBpManager().src == '') {
		const song = songStore.getCurPlayingSong();
		if (song != null) {
			bgPlayer.playSong(song);
		}
	} else {
		if (isUrlVaild(curPlayingSong)) {
			getBpManager().play();
		} else {
			updatePlayUrl();
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
		playSeek = 0;
		bgPlayer.playSong(preSong);
	}
}

bgPlayer.playNext = function() {
	const nextSong = songStore.getNextSong();
	if (typeof nextSong != 'undefined' && nextSong != null) {
		playSeek = 0;
		bgPlayer.playSong(nextSong);
	}
}

/**
 * 跳转到指定位置，单位 s
 */
bgPlayer.seekTo = function(pos) {
	getBpManager().seek(pos);
}


bgPlayer.setOnSongChangeCb = function(callback) {
	onSongChangeCallback = callback;
}

/**
 * 背景音频进入可以播放状态，但不保证后面可以流畅播放
 */
bgPlayer.setOnCanPlay = function(onCanPlayCb) {
	getBpManager().onCanplay((res) => {
		isPlaying = true;
		if (curPlayingSong.duration != uni.getBackgroundAudioManager().duration) {
			let duration = uni.getBackgroundAudioManager().duration;
			if (!isNaN(duration) && duration > 0) {
				curPlayingSong.duration = duration;
				songStore.updateDuration(curPlayingSong.id, duration);
			}
		}
		if (typeof onCanPlayCb === 'function') {
			onCanPlayCb();
		}
	});
}


bgPlayer.setOnErrored = function(errorCb) {
	getBpManager().onError((res) => {
		onPlayError(res);
		if (typeof errorCb === 'function') {
			errorCb();
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
			bgPlayer.playSong(curPlayingSong);
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
		if (curPlayingSong.duration != uni.getBackgroundAudioManager().duration) {
			let duration = uni.getBackgroundAudioManager().duration;
			if (!isNaN(duration) && duration > 0) {
				curPlayingSong.duration = duration;
				songStore.updateDuration(curPlayingSong.id, duration);
			}
		}
		if (typeof playedCb === 'function') {
			playedCb();
		}
		if (curPlayingSong.platform == 'netease') {
			//网易平台的歌曲播放就是应该url更新访问时间
			songStore.updateVisitTime(curPlayingSong.id);
		}
	});
}


/**
 * 背景音频播放进度更新事件
 */
bgPlayer.setTimeUpdate = function(updateCb) {
	getBpManager().onTimeUpdate((res) => {
		if (!isNaN(uni.getBackgroundAudioManager().currentTime)) {
			playSeek = uni.getBackgroundAudioManager().currentTime;
		}
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

import songStore from '@/utils/songStore.js'
import qqJs from '@/api/qq.js'
import kugouJs from '@/api/kugou.js'
import kuwoJs from '@/api/kuwo.js'
import neteaseJs from '@/api/netease.js'
import miguJs from '@/api/migu.js'

// 全局音频播放管理
let bgPlayer = {};

let bgAudioManager;
let curPlayingSong;
let playSeek = 0; //播放进度，单位s
let errorTime = 0; //播放出错次数

/**
 * 重新获取播放链接
 */
function updatePlayUrl() {
	switch (curPlayingSong.platform) {
		case 'netease':
			neteaseJs.neteaseSongUrl(curPlayingSong.id, (data) => {
				requestSongUrlSuccess(data);
			}, (error) => {
				requestSongUrlFailed(error);
			});
			break;
		case 'kuwo':
			kuwoJs.kuwoSongUrl(curPlayingSong.id, (data) => {
				requestSongUrlSuccess(data);
			}, (error) => {
				requestSongUrlFailed(error);
			});
		case 'qq':
			qqJs.qqSongUrl(curPlayingSong.id, (data) => {
				requestSongUrlSuccess(data);
			}, (error) => {
				requestSongUrlFailed(error);
			})
			break;
		case 'kugou':
			kugouJs.kugouSongData(curPlayingSong.id, curPlayingSong.albumId, (data) => {
				requestSongUrlSuccess(data.url);
			}, (error) => {
				requestSongUrlFailed(error);
			});
			break;
		case 'migu':
			miguJs.miguSongUrl(curPlayingSong.id, (data) => {
				requestSongUrlSuccess(data);
			}, (error) => {
				requestSongUrlFailed(error);
			});
			break;
	}
}

function requestSongUrlSuccess(newUrl) {
	curPlayingSong.url = newUrl;
	getBpManager().title = curPlayingSong.name;
	getBpManager().singer = curPlayingSong.singer;
	getBpManager().coverImgUrl = curPlayingSong.albumUrl;
	getBpManager().epname = curPlayingSong.albumName;
	getBpManager().startTime = playSeek;
	getBpManager().src = curPlayingSong.url; //设置连接后会自动开始播放
	songStore.updateUrl(newUrl);
}

function requestSongUrlFailed(error) {
	uni.showToast({
		title: error,
		icon: 'none',
		position: 'bottom'
	});

}

function getBpManager() {
	if (typeof bgAudioManager === 'undefined' || bgAudioManager == null) {
		bgAudioManager = uni.getBackgroundAudioManager();
		bgAudioManager.onError((res) => {
			console.log(res);
			//播放连接失效都是出现下面两种报错：{errCode: 10004, errMsg: "errCode:55, err:unknow format"}
			if ((res.errCode == 10004 || res.errMsg == 'setBackgroundAudioState:fail timeout') && errorTime ==
				0) {
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
		bgAudioManager.onTimeUpdate((res) => {
			playSeek = getBpManager().currentTime;
		});
		bgAudioManager.onPrev((res) => {
			bgPlayer.playPre();
		});
		bgAudioManager.onNext((res) => {
			bgPlayer.playNext();
		});
	}
	return bgAudioManager;
}

/**
 * 获取播放状态，true 表示暂停或停止，false 表示正在播放
 */
bgPlayer.isPlaying = function() {
	return !getBpManager().paused && typeof getBpManager().src != 'undefined' && getBpManager().src != null &&
		getBpManager().src != '';
}

/**
 * 当前音频的播放位置（单位：s）和当前音频的长度（单位：s）
 */
bgPlayer.getTime = function() {
	return [uni.getBackgroundAudioManager().currentTime, uni.getBackgroundAudioManager().duration];
}


bgPlayer.play = function(song) {
	//判断是不是正在播放同一个首歌
	if (bgPlayer.isPlaying() && typeof curPlayingSong != 'undefined' &&
		curPlayingSong != null &&
		curPlayingSong.id == song.id &&
		curPlayingSong.platform == song.platform) {
		return;
	}
	songStore.curPlayingSong = song;
	curPlayingSong = song;
	playSeek = 0;
	errorTime = 0;

	getBpManager().epname = song.albumName;
	getBpManager().title = song.name;
	getBpManager().singer = song.singer;
	getBpManager().coverImgUrl = song.albumUrl;
	getBpManager().src = song.url; //设置连接后会自动开始播放
}

bgPlayer.replay = function() {
	errorTime = 0;
	if (typeof getBpManager().src === 'undefined' || getBpManager().src == null || getBpManager().src == '') {
		const song = songStore.getCurPlayingSong();
		bgPlayer.play(song);
	} else {
		getBpManager().play();
	}
}

bgPlayer.pause = function() {
	getBpManager().pause();
}

bgPlayer.stop = function() {
	getBpManager().stop();
}

bgPlayer.playPre = function() {
	const preSong = songStore.getPreSong();
	if (preSong != null) {
		bgPlayer.play(preSong);
	} else {
		bgPlayer.stop();
	}
}

bgPlayer.playNext = function() {
	const nextSong = songStore.getNextSong();
	if (nextSong != null) {
		bgPlayer.play(nextSong);
	} else {
		bgPlayer.stop();
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
		bgPlayer.playNext();
		if (typeof endedCb === 'function') {
			endedCb();
		}
	});
}

bgPlayer.setOnStoped = function(stopedCb) {
	getBpManager().onStop(() => {
		if (typeof stopedCb === 'function') {
			stopedCb();
		}
	});
}

bgPlayer.setOnPaused = function(pausedCb) {
	getBpManager().onPause(() => {
		if (typeof pausedCb === 'function') {
			pausedCb();
		}
	});
}

bgPlayer.setOnPlayed = function(playedCb) {
	getBpManager().onPlay(() => {
		if (typeof playedCb === 'function') {
			playedCb();
		}
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

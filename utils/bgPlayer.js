import songStore from '@/utils/songStore.js'

// 全局音频播放管理
let bgPlayer = {};

let bgAudioManager;
let curPlayingSong;

function getBpManager(){
	if(typeof bgAudioManager === 'undefined' || bgAudioManager == null){
		bgAudioManager = uni.getBackgroundAudioManager();
		bgAudioManager.onError((res) => {
			bgPlayer.playNext();
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
	return !getBpManager().paused && typeof getBpManager().src != 'undefined' && getBpManager().src != null && getBpManager().src != '';
}

/**
 * 当前音频的播放位置（单位：s）和当前音频的长度（单位：s）
 */
bgPlayer.getTime = function() {
	return [getBpManager().currentTime, getBpManager().duration];
}


bgPlayer.play = function(song) {
	songStore.curPlayingSong = song;

	getBpManager().title = song.name;
	getBpManager().singer = song.singer;
	getBpManager().coverImgUrl = song.albumUrl;
	getBpManager().src = song.url; //设置连接后会自动开始播放

}

bgPlayer.replay = function() {
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
		if (typeof onCanPlayCb === 'function') {
			onCanPlayCb();
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

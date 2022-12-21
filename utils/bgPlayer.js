// 全局音频播放管理
let bgMp3Player = {};

let bgAudioManager = null;
let curPlayingSong = null;

function getPlayer() {
	if (bgAudioManager === undefined || bgAudioManager == null) {
		bgAudioManager = uni.getBackgroundAudioManager();
	}
	return bgAudioManager;
}

bgMp3Player.play = function(song) {
	getPlayer().src = song.url;
	getPlayer().title = song.name;
	getPlayer().singer = song.singer;
	getPlayer().coverImgUrl = song.albumUrl;
	getPlayer().au
	getPlayer().play();
	getPlayer().onPause(() => {
		
	});
	getPlayer().onEnded(() => {
		bgMp3Player.playNext();
	});
	getPlayer().onPrev(() => {
		getPlayer().pause();
		bgMp3Player.playPre();
	});
	getPlayer().onNext(() => {
		getPlayer().pause();
		bgMp3Player.playNext();
	});
	curPlayingSong = song;
}

bgMp3Player.replay = function() {
	getPlayer().play();
}

bgMp3Player.pause = function() {
	getPlayer().pause();
}

bgMp3Player.stop = function() {
	getPlayer().stop();
}

/**
 * 获取播放状态，true 表示暂停或停止，false 表示正在播放
 */
bgMp3Player.isPlaying = function() {
	return getPlayer().paused;
}

/**
 * 当前音频的播放位置（单位：s）和当前音频的长度（单位：s）
 */
bgMp3Player.getTime = function() {
	return [getPlayer().currentTime, getPlayer().duration];
}

bgMp3Player.playPre = function() {
	const preSong = curPlayingSong;
	bgMp3Player.play(preSong);
}

bgMp3Player.playNext = function() {
	const nextSong = curPlayingSong;
	bgMp3Player.play(nextSong);
}


/**
 * 背景音频进入可以播放状态，但不保证后面可以流畅播放
 */
bgMp3Player.setOnCanPlay = function(onCanPlayCb) {
	getPlayer().onCanplay(() => {
		onCanPlayCb();
	});
}

/**
 * 背景音频暂停事件
 */
bgMp3Player.setOnPause = function(pausedCb) {
	getPlayer().onPause(() => {
		pausedCb();
	});
}


/**
 * 背景音频自然播放结束事件
 */
bgMp3Player.setOnEnded = function(endedCb) {
	getPlayer().onEnded(() => {
		endedCb();
		bgMp3Player.playNext();
	});
}

/**
 * 背景音频播放进度更新事件
 */
bgMp3Player.setTimeUpdate = function(updateCb) {
	getPlayer().setTimeUpdate(updateCb);
}

module.exports = bgMp3Player

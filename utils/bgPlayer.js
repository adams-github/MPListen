// 全局音频播放管理
let bgMp3Player = {};

const player = uni.getBackgroundAudioManager();
let curPlayingSong;

/**
 * 获取播放状态，true 表示暂停或停止，false 表示正在播放
 */
bgMp3Player.isPlaying = function() {
	return player.paused;
}

/**
 * 当前音频的播放位置（单位：s）和当前音频的长度（单位：s）
 */
bgMp3Player.getTime = function() {
	return [player.currentTime, player.duration];
}


bgMp3Player.play = function(song) {
	if (!player.paused) {
		player.stop();
	}

	player.title = song.name;
	player.singer = song.singer;
	player.coverImgUrl = song.albumUrl;
	player.src = song.url; //设置连接后会自动开始播放
	player.onEnded((result) => {
		bgMp3Player.playNext();
	});
	player.onError((res) => {
		console.log('play.onError: ' + res);
	});
	player.onPrev((res) => {
		bgMp3Player.playPre();
	});
	player.onNext((res) => {
		bgMp3Player.playNext();
	});
	curPlayingSong = song;
}

bgMp3Player.replay = function() {
	if (player.src === '') {
		//从存储中获取歌曲播放

	} else {
		player.play();
	}
}

bgMp3Player.pause = function() {
	player.pause();
}

bgMp3Player.stop = function() {
	player.stop();
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
 * 跳转到指定位置，单位 s
 */
bgMp3Player.seekTo = function(pos) {
	player.seek(pos);
}

/**
 * 背景音频进入可以播放状态，但不保证后面可以流畅播放
 */
bgMp3Player.setOnCanPlay = function(onCanPlayCb) {
	if (typeof onCanPlayCb === 'function') {
		player.onCanplay(() => {
			onCanPlayCb();
		});
	}
}


/**
 * 背景音频自然播放结束事件
 */
bgMp3Player.setOnEnded = function(endedCb) {
	if (typeof endedCb === 'function') {
		player.onEnded(() => {
			endedCb();
			bgMp3Player.playNext();
		});
	}
}

/**
 * 背景音频播放进度更新事件
 */
bgMp3Player.setTimeUpdate = function(updateCb) {
	if (typeof onCanPlayCb === 'function') {
		player.onTimeUpdate(() => {
			onCanPlayCb();
		});
	}
}


/**
 * 音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
 */
bgMp3Player.setOnWaiting = function(waittingCb) {
	if (typeof waittingCb === 'function') {
		player.onWaiting(() => {
			waittingCb();
		});
	}
}

module.exports = bgMp3Player

// 全局音频播放管理
let bgMp3Player = {};

const player = uni.getBackgroundAudioManager();

bgMp3Player.play = function(song) {
	player.pause();
	player.src = song.url;
	player.title = song.name;
	player.singer = song.singer;
	player.coverImgUrl = song.albumUrl;
	player.play();
	player.onEnded(() => {
		bgMp3Player.playNext();
	});
	player.onError((res)=>{
		console.log('playOnError', res);
		uni.showToast({
			title:res,
			position:"bottom",
			icon: 'none'
		})
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
	player.play();
}

bgMp3Player.pause = function() {
	player.pause();
}

bgMp3Player.stop = function() {
	player.stop();
}

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
	player.onCanplay(() => {
		onCanPlayCb();
	});
}


/**
 * 背景音频自然播放结束事件
 */
bgMp3Player.setOnEnded = function(endedCb) {
	player.onEnded(() => {
		endedCb();
		bgMp3Player.playNext();
	});
}

/**
 * 背景音频播放进度更新事件
 */
bgMp3Player.setTimeUpdate = function(updateCb) {
	player.setTimeUpdate(updateCb);
}

module.exports = bgMp3Player

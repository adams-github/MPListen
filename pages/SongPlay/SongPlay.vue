<template>
	<page-meta :page-style="'overflow:'+(show?'hidden':'visible')"></page-meta>
	<view>
		<scroll-view scroll-y="true" scroll-with-animation="true">
			<view class="container">
				<image class="img-background" :src="picUrl" mode="aspectFill"></image>
				<view class="bg-mask"></view>

				<uni-nav-bar style="width: 100%;" leftIcon="back" :title="songName" color="#ffffff"
					backgroundColor="rgba(255, 255, 255, 0.00)" :statusBar="true" :shadow="false" :border="false"
					@clickLeft="toBack">
				</uni-nav-bar>
				<text style="color: white; font-size: 12px;">{{singer}}</text>

				<view class="img-bordor">
					<image class="header" :src="picUrl"></image>
				</view>

				<bing-lyric :lyrics="lyrics" :curTime="curTime" :lyricStyle="lyricStyle" :centerStyle="centerStyle"
					:areaStyle="cuAreaStyle"></bing-lyric>

				<view class="progress-container">
					<text style="color: #B9B9B9; font-size: 10px;">{{curTimeStr}}</text>
					<progress style="width: 80%; margin-left: 10px;" :percent="percent" stroke-width="3"
						backgroundColor="#B9B9B9" activeColor="#ffffff"></progress>
					<text style="color: #B9B9B9; font-size: 10px; margin-left: 10px;">{{durationStr}}</text>
				</view>

				<view class="playController">
					<image style="width: 25px; height: 25px;" :src="playModeSrc" @click="changePlayMode"></image>
					<image style="width: 30px; height: 30px;" src="../../static/ic_detail_pre_white.png"
						@click="onClickPre">
					</image>
					<image style="width: 70px; height: 70px;" class="play"
						:src="playStatus ? require('../../static/ic_detail_pause_white.png'):require('../../static/ic_detail_play_white.png')"
						@click="onClickPlay"></image>
					<image style="width: 30px; height: 30px;" src="../../static/ic_detail_next_white.png"
						@click="onClickNext">
					</image>
					<image style="width: 25px; height: 25px;" src="../../static/ic_main_songsheet.png"
						@click="onClickListBtn">
					</image>
				</view>

				<uni-popup ref="popup" background-color="#fff" @change="change">
					<playList :playing_song="playingSong" :delete_index="deleteIndex" :play_mode="playMode"
						@onItemClick="onClickSongItem" @onDeleteItemClick="onClickSongDelete"
						@onChangePlayMode="onChangePlayMode"></playList>
				</uni-popup>

				<uni-popup ref="alertDialog" type="dialog">
					<uni-popup-dialog type="info" cancelText="取消" confirmText="确定" title="删除歌曲" :content="deleteInfo"
						@confirm="onDeleteConfirm"></uni-popup-dialog>
				</uni-popup>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import songStore from '@/utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'
	import kugouJs from '@/api/kugou.js'
	import kuwoJs from '@/api/kuwo.js'
	import neteaseJs from '@/api/netease.js'
	import miguJs from '@/api/migu.js'

	export default {
		onLoad() {
			//循环方式需要手动修改，所以只需要加载一次
			this.playMode = songStore.getPlayMode();
			this.initModeView();

			bgPlayer.setOnEnded(() => {
				//一首歌播放结束，设置已加载歌曲信息和已加载歌词为false
				this.hasLoadSongInfo = false;
				this.hasLoadLyrics = false;
			});
			bgPlayer.setOnPred(() => {
				this.hasLoadSongInfo = false;
				this.hasLoadLyrics = false;
			});
			bgPlayer.setOnNexted(() => {
				this.hasLoadSongInfo = false;
				this.hasLoadLyrics = false;
			});
			bgPlayer.setOnPaused(() => {
				this.playStatus = false;
			});
			bgPlayer.setOnStoped(() => {
				this.playStatus = false;
				this.playingSong = {};
			});
			bgPlayer.setOnPlayed(() => {
				//播放回调可能会回调多次，第一次播放，或者暂停后重新播放都会回调这个方法
				this.updateTimestamp = -1;
				this.playStatus = true;
				this.playingSong = songStore.getCurPlayingSong();
				this.duration = bgPlayer.getPlayingDuration();
				this.durationStr = this.formateSeconds(this.duration);

				if (!this.hasLoadSongInfo) {
					this.hasLoadSongInfo = true;

					this.picUrl = this.playingSong.albumUrl;
					this.songName = this.playingSong.name;
					this.singer = this.playingSong.singer;
					uni.setNavigationBarTitle({
						title: this.songName
					});
				}
				if (!this.hasLoadLyrics) {
					this.loadLyrics();
				}
			});
			bgPlayer.setTimeUpdate((seconds) => {
				//限制一秒更新一次，避免一直更新页面，容易引起卡顿
				if (seconds - this.updateTimestamp > 1) {
					this.updateTimestamp = seconds;
					this.curTime = seconds;
					this.percent = seconds / this.duration * 100;
					this.curTimeStr = this.formateSeconds(this.curTime);
				}
			});
		},
		onShow() {
			//先判断是否已经加载过歌曲信息，没有加载过再加载
			if (!this.hasLoadSongInfo) {
				this.hasLoadSongInfo = true;

				this.playStatus = bgPlayer.isPlaying();
				this.duration = bgPlayer.getPlayingDuration();
				this.durationStr = this.formateSeconds(this.duration);
				this.curTime = bgPlayer.getPlayingCurTime();
				this.curTimeStr = this.formateSeconds(this.curTime);
				this.percent = this.curTime / this.duration * 100;

				this.playingSong = songStore.getCurPlayingSong();
				this.picUrl = this.playingSong.albumUrl;
				this.songName = this.playingSong.name;
				this.singer = this.playingSong.singer;
				this.curTime = bgPlayer.getPlayingCurTime();
				this.curTimeStr = this.formateSeconds(this.curTime);

				uni.setNavigationBarTitle({
					title: this.songName
				});
			}
			//先判断是否已经加载过歌词，没有加载过再加载
			if (!this.hasLoadLyrics) {
				this.loadLyrics();
			}
			this.updateTimestamp = -1;
		},
		onUnload() {
			bgPlayer.setOnEnded(null);
			bgPlayer.setOnPaused(null);
			bgPlayer.setOnStoped(null);
			bgPlayer.setOnPlayed(null);
			bgPlayer.setTimeUpdate(null);
			bgPlayer.setOnPred(null);
			bgPlayer.setOnNexted(null);
		},
		data() {
			return {
				centerStyle: {
					btnImg: '../../static/btn.png',
				},
				lyricStyle: {
					color: "#B9B9B9",
					activeColor: '#ffffff',
					fontSize: '14px',
					activeFontSize: '20px',
					lineHeight: '40px',
					activeLineHeight: '32px',
					selectedBGColor: 'inherit'
				},
				cuAreaStyle: {
					width: '100vw',
					height: '30vh',
					background: 'transparent'
				},

				hasLoadSongInfo: false,
				playStatus: false,
				playingSong: {},
				picUrl: '',
				songName: '',
				singer: '',

				updateTimestamp: -1,
				duration: 0,
				curTime: 0,
				durationStr: '',
				curTimeStr: '',
				percent: 0,
				playMode: 1,
				playModeSrc: '',
				hasLoadLyrics: false,
				lyrics: [],

				tempDeleteIndex: -1,
				deleteIndex: -1,
				deleteInfo: '',
				show: false,
			};
		},
		methods: {
			toBack() {
				uni.navigateBack();
			},
			initModeView() {
				switch (this.playMode) {
					case 0:
						this.playModeSrc = '../../static/ic_mode_single_white.png';
						break;
					case 1:
						this.playModeSrc = '../../static/ic_mode_circle_white.png';
						break;
					case 2:
						this.playModeSrc = '../../static/ic_mode_random_white.png';
						break;
				}
			},
			/**
			 * 加载歌词
			 * */
			loadLyrics() {
				if (typeof this.playingSong === 'undefined' || this.playingSong == null) return;

				if (this.playingSong.platform == 'qq') {
					this.lyrics = ['[00:00]QQ平台无法获取歌词'];
					this.hasLoadLyrics = true;
				} else {
					this.lyrics = ['[00:00]加载歌词中...'];

					switch (this.playingSong.platform) {
						case 'kuwo':
							kuwoJs.kuwoSongInfo(this.playingSong.id, (data) => {
								this.handlerKuwoLyrics(data.lrclist);
							}, (error) => {
								this.requestError(error);
							})
							break;
						case 'kugou':
							kugouJs.kugouSongData(this.playingSong.id, this.playingSong.albumId, (data) => {
								this.handlerKugouLyrics(data.lyrics);
							}, (error) => {
								this.requestError(error);
							})
							break;
						case 'netease':
							neteaseJs.neteaseLyric(this.playingSong.id, (data) => {
								this.handlerNeteaseLyrics(data);
							}, (error) => {
								this.requestError(error);
							})
							break;
						case 'migu':
							miguJs.miguSonglyric(this.playingSong.lyricUrl, (data) => {
								this.lyrics = data.split('\r');
								this.hasLoadLyrics = true;
							}, (error) => {
								this.requestError(error);
							})
							break;
					}
				}
			},
			handlerKuwoLyrics(lrclist) {
				this.lyrics = [];
				lrclist.forEach((item, index) => {
					this.lyrics.push('[' + parseFloat(item.time) + ']' + item.lineLyric);
				});
				this.hasLoadLyrics = true;
			},
			handlerKugouLyrics(lyrics) {
				this.lyrics = [];
				const lrclist = lyrics.split('\r\n');
				let add = false;
				lrclist.forEach((item, index) => {
					if (add) {
						this.lyrics.push(item);
					}
					if (item == '[offset:0]') {
						add = true;
					}
				});
				this.hasLoadLyrics = true;
			},
			handlerNeteaseLyrics(lyrics) {
				this.lyrics = [];
				const lrclist = lyrics.split('\n');
				lrclist.forEach((item, index) => {
					this.lyrics.push(item);
				});
				this.hasLoadLyrics = true;
			},
			requestError(error) {
				uni.showToast({
					title: error,
					icon: 'none',
					position: 'bottom'
				});
				this.lyrics = ['[00:00]加载歌词失败，请点击重试'];
				this.hasLoadLyrics = false;
			},
			changePlayMode() {
				this.playMode++;
				this.playMode = this.playMode % 3;
				this.initModeView();
				songStore.changePlayMode(this.playMode);
			},
			onClickPre() {
				this.hasLoadSongInfo = false;
				this.hasLoadLyrics = false;
				bgPlayer.playPre();
			},
			onClickPlay() {
				if (this.playStatus) {
					bgPlayer.pause();
				} else {
					bgPlayer.replay();
				}
			},
			onClickNext() {
				this.hasLoadSongInfo = false;
				this.hasLoadLyrics = false;
				bgPlayer.playNext();
			},
			onClickListBtn() {
				this.deleteIndex = -1;
				this.$refs.popup.open('bottom');
			},
			onChangePlayMode(val) {
				this.playMode = val;
				this.initModeView();
			},
			onClickSongItem() {
				this.playStatus = false;
				this.picUrl = songStore.getCurPlayingSong().albumUrl;
				this.songName = songStore.getCurPlayingSong().name;
			},
			onClickSongDelete(index) {
				this.deleteIndex = -1;
				this.tempDeleteIndex = index;
				const deleteSong = songStore.getSongByIndex(index);
				this.deleteInfo = '确定要删除\"' + deleteSong.singer + '-' + deleteSong.name + '\"?';
				this.$refs.alertDialog.open()
			},
			onDeleteConfirm() {
				this.deleteIndex = this.tempDeleteIndex;
			},
			change(e) {
				this.show = e.show;
			},
			formateSeconds(seconds) {
				let secondTime = parseInt(seconds); //将传入的秒的值转化为Number
				let min = 0; // 初始化分
				let h = 0; // 初始化小时
				let result = '';
				if (secondTime >= 60) { //如果秒数大于等于60，将秒数转换成整数
					min = parseInt(secondTime / 60); //获取分钟，除以60取整数，得到整数分钟
					secondTime = parseInt(secondTime % 60); //获取秒数，秒数取佘，得到整数秒数
					if (min >= 60) { //如果分钟大于等于60，将分钟转换成小时
						h = parseInt(min / 60); //获取小时，获取分钟除以60，得到整数小时
						min = parseInt(min % 60); //获取小时后取佘的分，获取分钟除以60取佘的分
					}
				}
				if (h > 0) {
					result =
						`${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}:${secondTime.toString().padStart(2,'0')}`;
				} else {
					result = `${min.toString().padStart(2,'0')}:${secondTime.toString().padStart(2,'0')}`;
				}
				return result;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		height: 100%;
		min-height: 100vh;
		padding-bottom: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;

		.img-background {
			width: 100%;
			height: 100%;
			position: absolute;
			z-index: -100;
			right: 0;
			left: 0;
			// filter 将模糊或颜色偏移等图形效果应用于元素。滤镜通常用于调整图像、背景和边框的渲染
			filter: blur(15px);
			// opacity 属性指定了一个元素的不透明度。换言之，opacity 属性指定了一个元素后面的背景的被覆盖程度。
			opacity: 0.8;
		}

		.bg-mask {
			width: 100%;
			height: 100%;
			position: absolute;
			z-index: -99;
			right: 0;
			left: 0;
			background-color: rgba(0, 0, 0, 0.40);
		}

		.title {
			max-width: 150px;
			color: white;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: 15px;
		}

		.img-bordor {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 80vw;
			height: 80vw;
			border-radius: 40vw;
			margin-top: 5vw;
			background-color: rgba(255, 255, 255, 0.05);

			.header {
				width: 74vw;
				height: 74vw;
				border-radius: 37vw;
			}
		}

		.progress-container {
			width: 80%;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
		}

		.playController {
			width: 80%;
			margin-top: 10px;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>

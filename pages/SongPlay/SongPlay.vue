<template>
	<page-meta :page-style="'overflow:'+(popupShow?'hidden':'visible')"></page-meta>
	<view>
		<scroll-view scroll-y="true" scroll-with-animation="true">
			<view class="container">
				<image class="img-background" :src="playingSong.albumUrl" mode="aspectFill"></image>
				<view class="bg-mask"></view>
				<uni-nav-bar style="width: 100%;" leftIcon="back" :title="songName" color="#ffffff"
					backgroundColor="rgba(255, 255, 255, 0.00)" :statusBar="true" :shadow="false" :border="false"
					@clickLeft="toBack">
				</uni-nav-bar>
				<view style="width: 100%; display: flex; justify-content: center; align-items: center;">
					<text class="platform-text">{{platformStr}}</text>
					<text class="singer-text">{{singer}}</text>
				</view>
				<view style="width: 100%; height: 67vh; max-height: 67vh; 
				display: flex; flex-direction: column; align-items: center; 
				margin-top: 2vh;">
					<view class="img-bordor" v-show="showHeader">
						<image class="header" :class="{'header-animate' : hasLoadSongInfo}"
							:style="{animationPlayState: animationStatue}" :src="picUrl">
						</image>
					</view>
					<CommonLyrics :lyrics="lyrics" :curTime="curTime" :lyricStyle="lyricStyle" :areaStyle="cuAreaStyle"
						@onClickLyrics="onClickLyric"></CommonLyrics>
				</view>
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
					<PlayList :playing_song="playingSong" :delete_index="deleteIndex" :play_mode="playMode"
						@onDeleteItemClick="onClickSongDelete" @onChangePlayMode="onChangePlayMode"></PlayList>
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
	import qqJs from '../../api/qq'

	var updateTimestamp = -1;
	var hasLoadLyrics = false;
	var tempDeleteIndex = -1;

	export default {
		onLoad() {
			this.playingSong = songStore.getCurPlayingSong();
			this.songName = this.playingSong.name;
			this.singer = this.playingSong.singer;
			this.initPlatform();
			this.initPic();
			this.hasLoadSongInfo = true;
			this.playStatus = bgPlayer.isPlaying();
			this.animationStatue = this.playStatus ? 'running' : 'paused';

			this.curTime = bgPlayer.getPlayingCurTime();
			this.curTimeStr = this.formateSeconds(this.curTime);
			this.durationStr = this.formateSeconds(this.playingSong.duration);
			this.percent = this.curTime / this.playingSong.duration * 100;
			this.playMode = songStore.getPlayMode();
			this.initModeView();
			this.loadLyrics();

			bgPlayer.setOnPaused(() => {
				this.playStatus = false;
				this.animationStatue = 'paused';
			});
			bgPlayer.setOnStoped(() => {
				this.playStatus = false;
				this.animationStatue = 'paused';
				this.playingSong = {};
			});
			bgPlayer.setOnErrored(() => {
				this.playStatus = false;
				this.animationStatue = 'paused';
				this.playingSong = {};
			});
			bgPlayer.setOnPlayed(() => {
				//播放回调可能会回调多次，第一次播放，或者暂停后重新播放都会回调这个方法
				updateTimestamp = -1;
				this.playStatus = true;
				this.animationStatue = 'running';
			});
			bgPlayer.setTimeUpdate((seconds) => {
				//限制一秒更新一次，避免一直更新页面，容易引起卡顿
				if (seconds - updateTimestamp > 1) {
					updateTimestamp = seconds;
					this.curTime = seconds;
					this.curTimeStr = this.formateSeconds(this.curTime);
					this.percent = seconds / this.playingSong.duration * 100;
				}
			});
			bgPlayer.setOnSongChangeCb(() => {
				this.hasLoadSongInfo = false;
				this.playingSong = songStore.getCurPlayingSong();
				this.songName = this.playingSong.name;
				this.singer = this.playingSong.singer;
				this.initPlatform();
				this.initPic();
				this.curTime = 0;
				this.curTimeStr = this.formateSeconds(0);
				this.durationStr = this.formateSeconds(this.playingSong.duration);
				this.loadLyrics();
				setTimeout(() => {
					this.hasLoadSongInfo = true;
				}, 100);
			});
		},
		onShow() {
			updateTimestamp = -1;
		},
		onUnload() {
			bgPlayer.setOnPaused(null);
			bgPlayer.setOnStoped(null);
			bgPlayer.setOnErrored(null);
			bgPlayer.setOnPlayed(null);
			bgPlayer.setTimeUpdate(null);
			bgPlayer.setOnSongChangeCb(null);
		},
		onBackPress(options) {
			// #ifdef APP-PLUS || MP-ALIPAY || H5
			if (this.popupShow) {
				this.$refs.popup.close();
				return true;
			}
			// #endif
		},
		data() {
			return {
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
					height: '30vh'
				},

				hasLoadSongInfo: false,
				playStatus: false,
				playingSong: {},
				picUrl: '',
				songName: '',
				singer: '',
				platformStr: '',
				showHeader: true,
				animationStatue: 'paused',

				curTime: 0,
				durationStr: '',
				curTimeStr: '',
				percent: 0,
				playMode: 1,
				playModeSrc: '',
				lyrics: [],

				deleteIndex: -1,
				deleteInfo: '',
				popupShow: false,
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
			initPlatform() {
				switch (this.playingSong.platform) {
					case 'netease':
						this.platformStr = '网易';
						break;
					case 'kuwo':
						this.platformStr = '酷我';
						break;
					case 'qq':
						this.platformStr = 'QQ';
						break;
					case 'kugou':
						this.platformStr = '酷狗';
						break;
					case 'migu':
						this.platformStr = '咪咕';
						break;
				}
			},
			initPic() {
				switch (this.playingSong.platform) {
					case 'kuwo':
						this.picUrl = this.playingSong.albumUrl.replace('/120/', '/700/');
						break;
					case 'qq':
						this.picUrl = this.playingSong.albumUrl.replace('300x300', '500x500');
						break;
					default:
						this.picUrl = this.playingSong.albumUrl;
						break;
				}
			},
			/**
			 * 加载歌词
			 * */
			loadLyrics() {
				if (typeof this.playingSong === 'undefined' || this.playingSong == null) return;

				hasLoadLyrics = true;
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
					case 'qq':
						qqJs.qqlyricForMPWX(this.playingSong.lyricId, (data) => {
							this.handlerQQLyrics(data);
						}, (error) => {
							this.requestError(error);
						});
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
						}, (error) => {
							this.requestError(error);
						})
						break;
				}
			},
			handlerKuwoLyrics(lrclist) {
				this.lyrics = [];
				lrclist.forEach((item, index) => {
					this.lyrics.push('[' + parseFloat(item.time) + ']' + item.lineLyric);
				});
			},
			handlerKugouLyrics(lyrics) {
				this.lyrics = [];
				const lrclist = lyrics.split('\r\n');
				lrclist.forEach((item, index) => {
					this.lyrics.push(item);
				});
			},
			handlerQQLyrics(lyrics) {
				this.lyrics = [];
				const lrclist = lyrics.split('\n');
				lrclist.forEach((item, index) => {
					this.lyrics.push(item);
				});
			},
			handlerNeteaseLyrics(lyrics) {
				this.lyrics = [];
				const lrclist = lyrics.split('\n');
				lrclist.forEach((item, index) => {
					this.lyrics.push(item);
				});
			},
			requestError(error) {
				uni.showToast({
					title: error,
					icon: 'none',
					position: 'bottom'
				});
				this.lyrics = ['[00:00]歌词加载失败，请点击重试'];
				hasLoadLyrics = false;
			},
			changePlayMode() {
				this.playMode++;
				this.playMode = this.playMode % 3;
				this.initModeView();
				songStore.changePlayMode(this.playMode);
			},
			onClickPre() {
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
				this.popupShow = e.show;
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
			onClickLyric() {
				if (!hasLoadLyrics && this.lyrics.length == 1 && this.lyrics[0] === '[00:00]歌词加载失败，请点击重试') {
					this.loadLyrics();
				} else {
					if (this.lyrics.length > 1) {
						if (this.showHeader) {
							this.showHeader = false;
							this.cuAreaStyle = {
								width: '100vw',
								height: '67vh'
							};
						} else {
							//先让歌词缩小，再延迟150毫秒让图片展示出来，这样可以避免歌词越界显示
							this.cuAreaStyle = {
								width: '100vw',
								height: '30vh'
							};
							setTimeout(() => {
								this.showHeader = true;
							}, 150);
						}
					}
				}
			}
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

		.singer-text {
			color: white;
			font-size: 12px;
			max-width: 40vw;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.platform-text {
			font-size: 10px;
			color: white;
			border-style: solid;
			border-color: white;
			border-width: 1rpx;
			border-radius: 3px;
			padding: 1px;
			text-align: center;
			position: absolute;
			left: 15vw;
		}

		.img-bordor {
			width: 37vh;
			height: 37vh;
			border-radius: 18.5vh;
			background-color: rgba(255, 255, 255, 0.05);

			.header {
				margin: 1.5vh;
				width: 34vh;
				height: 34vh;
				border-radius: 17vh;
			}

			.header-animate {
				animation-name: rotate;
				animation-duration: 36s;
				animation-timing-function: linear;
				animation-iteration-count: infinite;
			}

			@keyframes rotate {
				from {
					transform: rotate(0deg);
				}

				to {
					transform: rotate(360deg);
				}
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

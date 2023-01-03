<template>
	<page-meta :page-style="'overflow:'+(show?'hidden':'visible')"></page-meta>
	<view class="container">
		<image class="img-background" :src="picUrl" mode="aspectFill"></image>
		<view class="bg-mask"></view>

		<uni-nav-bar style="width: 100%;" leftIcon="back" :title="songName" color="#ffffff"
			backgroundColor="rgba(255, 255, 255, 0.00)" :statusBar="true" :shadow="false" :border="false"
			@clickLeft="toBack">
		</uni-nav-bar>
		<text style="color: white; font-size: 12px;">{{playingSong.singer}}</text>

		<view class="img-bordor">
			<image class="header" :src="picUrl"></image>
		</view>

		<bing-lyric :lyrics="lyrics" :curTime="curTime" :lyricStyle="lyricStyle" :centerStyle="centerStyle"
			:areaStyle="cuAreaStyle"></bing-lyric>
			
		<!-- <progress :percent="percent" stroke-width="3"></progress> -->

		<view class="playController">
			<image style="width: 25px; height: 25px;" :src="playModeSrc" @click="changePlayMode"></image>
			<image style="width: 30px; height: 30px;" src="../../static/ic_detail_pre_white.png" @click="onClickPre">
			</image>
			<image style="width: 70px; height: 70px;" class="play"
				:src="playStatus ? require('../../static/ic_detail_pause_white.png'):require('../../static/ic_detail_play_white.png')"
				@click="onClickPlay"></image>
			<image style="width: 30px; height: 30px;" src="../../static/ic_detail_next_white.png" @click="onClickNext">
			</image>
			<image style="width: 25px; height: 25px;" src="../../static/ic_main_songsheet.png" @click="onClickListBtn">
			</image>
		</view>

		<uni-popup ref="popup" background-color="#fff" @change="change">
			<playList :playing_song="playingSong" :delete_index="deleteIndex" @onItemClick="onClickSongItem"
				@onDeleteItemClick="onClickSongDelete"></playList>
		</uni-popup>

		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog type="info" cancelText="取消" confirmText="确定" title="删除歌曲" :content="deleteInfo"
				@confirm="onDeleteConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import songStore from '@/utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'
	import kugouJs from '@/api/kugou.js'
	import kuwoJs from '@/api/kuwo.js'
	import neteaseJs from '@/api/netease.js'
	import miguJs from '@/api/migu.js'
	import log from '../../utils/lib/log'

	export default {
		onLoad() {

		},
		onShow() {
			bgPlayer.setOnEnded(() => {
				this.picUrl = songStore.getCurPlayingSong().albumUrl;
				this.songName = songStore.getCurPlayingSong().name;
			});
			bgPlayer.setOnPaused(() => {
				this.playStatus = false;
			});
			bgPlayer.setOnStoped(() => {
				this.playStatus = false;
			});
			bgPlayer.setOnCanPlay(() => {
				this.hasLoadLyrics = false;
			});
			bgPlayer.setOnPlayed(() => {
				this.playStatus = true;
				this.playingSong = songStore.getCurPlayingSong();
				this.picUrl = this.playingSong.albumUrl;
				this.songName = this.playingSong.name;
				this.duration = bgPlayer.getTime()[1];
				if (!this.hasLoadLyrics) {
					this.loadLyrics();
				}
			});
			bgPlayer.setTimeUpdate((data) => {
				this.curTime = data;
			});
			this.playStatus = bgPlayer.isPlaying();
			this.playingSong = songStore.getCurPlayingSong();
			this.playMode = songStore.getPlayMode();
			this.initModeView();

			if (typeof this.playingSong != 'undefined' &&
				this.playingSong != null) {
				this.picUrl = songStore.getCurPlayingSong().albumUrl;
				this.songName = songStore.getCurPlayingSong().name;
				this.curTime = bgPlayer.getTime()[0];
				uni.setNavigationBarTitle({
					title: this.songName
				});
			}
		},
		onReady() {
			this.loadLyrics();
		},
		onUnload() {
			bgPlayer.setOnEnded(null);
			bgPlayer.setOnPaused(null);
			bgPlayer.setOnStoped(null);
			bgPlayer.setOnPlayed(null);
			bgPlayer.setTimeUpdate(null);
		},
		data() {
			return {
				playStatus: false,
				playingSong: {},
				picUrl: '',
				songName: '',
				tempDeleteIndex: -1,
				deleteIndex: -1,
				deleteInfo: '',
				duration: 0,
				curTime: 0,
				percent:0,
				playMode: 1,
				playModeSrc: '',
				hasLoadLyrics: false,
				lyrics: [],
				styles: {},
				centerStyle: {
					btnImg: '../../static/btn.png',
				},
				lyricStyle: {
					color: "#909399",
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;

		.img-background {
			position: absolute;
			z-index: -100;
			right: 0;
			left: 0;
			height: 100%;
			width: 100%;
			// filter 将模糊或颜色偏移等图形效果应用于元素。滤镜通常用于调整图像、背景和边框的渲染
			filter: blur(15px);
			// opacity 属性指定了一个元素的不透明度。换言之，opacity 属性指定了一个元素后面的背景的被覆盖程度。
			opacity: 0.8;
		}

		.bg-mask {
			position: absolute;
			z-index: -99;
			right: 0;
			left: 0;
			height: 100%;
			width: 100%;
			background-color: rgba(0, 0, 0, 0.35);
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
			width: 270px;
			height: 270px;
			border-radius: 135px;
			margin-top: 30px;
			background-color: rgba(255, 255, 255, 0.05);

			.header {
				width: 250px;
				height: 250px;
				border-radius: 125px;
			}
		}

		.playController {
			width: 80%;
			margin-top: 20px;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

		}
	}
</style>

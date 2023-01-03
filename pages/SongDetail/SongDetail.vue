<template>
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
				this.playingSong = {};
			});
			bgPlayer.setOnStoped(() => {
				this.playStatus = false;
				this.playingSong = {};
			});
			bgPlayer.setOnPlayed(() => {
				this.playStatus = true;
				this.playingSong = songStore.getCurPlayingSong();
				this.picUrl = this.playingSong.albumUrl;
				this.songName = this.playingSong.name;
			});
			bgPlayer.setTimeUpdate((data) => {
				this.curTime = data;
			});
			this.playStatus = bgPlayer.isPlaying();
			this.playingSong = songStore.getCurPlayingSong();
			if (typeof this.playingSong != 'undefined' &&
				this.playingSong != null) {
				this.picUrl = songStore.getCurPlayingSong().albumUrl;
				this.songName = songStore.getCurPlayingSong().name;
				uni.setNavigationBarTitle({
					title: this.songName
				});

				if (this.playingSong.platform == 'qq') {
					this.lyrics = ['[00:00]QQ平台目前无法获取歌词'];
				}
			}
		},
		onHide() {
			bgPlayer.setOnEnded(null);
			bgPlayer.setOnPaused(null);
			bgPlayer.setOnStoped(null);
			bgPlayer.setOnPlayed(null);
		},
		onReady() {
			this.loadLyrics();
		},
		data() {
			return {
				playStatus: false,
				playingSong: {},
				picUrl: '',
				songName: '',
				curTime: 0,
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
					height: '20vh',
					background: 'transparent'
				},
			};
		},
		methods: {
			toBack() {
				uni.navigateBack();
			},
			/**
			 * 加载歌词
			 * */
			loadLyrics() {
				if (typeof this.playingSong === 'undefined' || this.playingSong == null) return;

				if (this.playingSong.platform == 'qq') {
					this.lyrics = ['[00:00]QQ平台无法获取歌词'];
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
				this.lyrics = ['[00:00]加载歌词失败，请点击重试'];
			},
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
			width: 290px;
			height: 290px;
			border-radius: 145px;
			margin-top: 30px;
			background-color: rgba(255, 255, 255, 0.05);

			.header {
				width: 270px;
				height: 270px;
				border-radius: 135px;
			}
		}
	}
</style>

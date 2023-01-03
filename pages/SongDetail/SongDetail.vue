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
	</view>
</template>

<script>
	import songStore from '@/utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'

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
			this.playStatus = bgPlayer.isPlaying();
			this.playingSong = songStore.getCurPlayingSong();
			if (typeof this.playingSong != 'undefined' &&
				this.playingSong != null) {
				this.picUrl = songStore.getCurPlayingSong().albumUrl;
				this.songName = songStore.getCurPlayingSong().name;
				uni.setNavigationBarTitle({
					title: this.songName
				});
			}

		},
		onHide() {
			bgPlayer.setOnEnded(null);
			bgPlayer.setOnPaused(null);
			bgPlayer.setOnStoped(null);
			bgPlayer.setOnPlayed(null);
		},
		onReady() {
		},
		data() {
			return {
				playStatus: false,
				playingSong: {},
				picUrl: '',
				songName: '',
				styles: {}
			};
		},
		methods: {
			toBack() {
				uni.navigateBack();
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

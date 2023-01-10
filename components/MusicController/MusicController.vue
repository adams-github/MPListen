<template>
	<view class="container">
		<view class="controller-box">
			<image class="picture" :class="{'picture-animate' : isShowing}"
				:style="{animationPlayState: animationStatue}" :src="picUrl" @click="onClickPicture"
				@error="loadImgError"></image>
			<text
				style="color: black; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 50%;">{{songName}}</text>

			<view class="play-container" hover-class="btn-hover">
				<image class="play"
					:src="playStatus ? require('../../static/ic_main_pause.png'):require('../../static/ic_main_play.png')"
					@click="onClickPlay"></image>
			</view>
			<view class="next-container" hover-class="btn-hover">
				<image class="next" hover-class="btn-hover" src="../../static/ic_main_next.png" @click="onClickNext">
				</image>
			</view>
			<view class="list-container" hover-class="btn-hover">
				<image class="list" src="../../static/ic_main_songsheet_active.png"
					@click="onClickList"></image>
			</view>
		</view>
	</view>
</template>

<script>
	import bgPlayer from '@/utils/bgPlayer.js'

	export default {
		name: "MusicController",
		emits: ['clickPic', 'clickPlay', 'clickList'],
		props: {
			pic_url: {
				type: String,
				default: ""
			},
			song_name: {
				type: String,
				default: ""
			},
			play_status: {
				type: Boolean,
				default: false
			},
			page_show: {
				type: Boolean,
				default: true
			}
		},
		watch: {
			pic_url: {
				immediate: true,
				handler(val) {
					this.picUrl = val;
				}
			},
			song_name: {
				immediate: true,
				handler(val) {
					this.songName = val;
				}
			},
			play_status: {
				immediate: true,
				handler(val) {
					this.playStatus = val;
					this.animationStatue = val ? 'running' : 'paused';
				}
			},
			page_show: {
				immediate: true,
				handler(val) {
					this.isShowing = val;
				}
			}
		},
		data() {
			return {
				picUrl: '',
				songName: '',
				playStatus: false,
				isShowing: true,
				animationStatue: 'paused',
			};
		},
		methods: {
			loadImgError() {
				this.picUrl = '../../static/ic_main_cd_default.jpg';
			},
			onClickPicture() {
				this.$emit("clickPic");
			},
			onClickPlay() {
				this.$emit("clickPlay");
			},
			onClickNext() {
				bgPlayer.playNext();
			},
			onClickList() {
				this.$emit("clickList");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		height: 40px;
		display: flex;
		background-color: white;

		.controller-box {
			display: flex;
			flex-direction: row;
			align-items: center;
			width: 100%;
			height: 40px;
			border-radius: 20px;
			border: 1px solid white;

			.picture {
				width: 40px;
				height: 40px;
				border-radius: 20px;
				margin-left: 5px;
				margin-bottom: 8px;
			}

			.picture-animate {
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

			.play-container {
				width: 30px;
				height: 30px;
				border-radius: 3px;
				display: flex;
				justify-content: center;
				align-items: center;
				position: absolute;
				right: 90px;

				.play {
					width: 25px;
					height: 25px;
				}
			}


			.next-container {
				width: 30px;
				height: 30px;
				border-radius: 3px;
				display: flex;
				justify-content: center;
				align-items: center;
				position: absolute;
				right: 50px;

				.next {
					width: 25px;
					height: 25px;
				}
			}


			.list-container {
				width: 30px;
				height: 30px;
				border-radius: 3px;
				display: flex;
				justify-content: center;
				align-items: center;
				position: absolute;
				right: 10px;

				.list {
					width: 25px;
					height: 25px;
				}
			}

			.btn-hover {
				background-color: #F0F0F0;
			}

		}
	}
</style>

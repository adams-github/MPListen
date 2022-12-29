<template>
	<view class="container">
		<view class="controller-box">
			<image class="picture" :src="picUrl" @click="onClickPicture"></image>
			<text style="color: black; margin-left: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 50%;">{{songName}}</text>
			<image class="play" :src="playStatus ? require('../../static/ic_main_pause.png'):require('../../static/ic_main_play.png')" @click="onClickPlay"></image>
			<image class="next" src="../../static/ic_main_next.png" @click="onClickNext"></image>
			<image class="list" src="../../static/ic_main_songsheet_active.png" @click="onClickList"></image>
		</view>
	</view>
</template>

<script>
	export default {
		name: "MusicController",
		emits: ['clickPic', 'clickPlay', 'clickNext', 'clickList'],
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
			}
		},
		watch: {
			pic_url: {
				immediate: true,
				handler(val) {
					if (typeof val != 'undefined' && val != null && val != ''){
						this.picUrl = val;
					}else{
						this.picUrl = '../../static/ic_main_cd_default.jpg';
					}
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
				}
			},
		},
		data() {
			return {
				picUrl: '../../static/ic_main_cd_default.jpg',
				songName: '',
				playStatus: false
			};
		},
		methods:{
			onClickPicture(){
				this.$emit("clickPic");
			},
			onClickPlay(){
				this.$emit("clickPlay");
			},
			onClickNext(){
				this.$emit("clickNext");
			},
			onClickList(){
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

			.play {
				width: 30px;
				height: 30px;
				position: absolute;
				right: 85px;
			}

			.next {
				width: 30px;
				height: 30px;
				position: absolute;
				right: 45px;
			}

			.list {
				width: 30px;
				height: 30px;
				position: absolute;
				right: 5px;
			}

		}
	}
</style>

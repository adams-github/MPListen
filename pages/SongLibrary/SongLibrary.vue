<template>
	<page-meta :page-style="'overflow:'+(show?'hidden':'visible')"></page-meta>
	<view class="view-container">
		<view @click="navigateToSearch">
			<uni-search-bar bgColor="#ffffff" placeholder="搜索" radius="40" readonly>
			</uni-search-bar>
		</view>

		<view class="controller-sticky" v-show="showController">
			<MusicController :pic_url="picUrl" :song_name="songName" :play_status="playStatus"
				@clickPlay="onClickPlayBtn" @clickNext="onClickNextBtn" @clickList="onClickListBtn">
			</MusicController>
		</view>

		<uni-popup ref="popup" background-color="#fff" type="bottom" @change="change">
			<playList :playing_song="playingSong"></playList>
		</uni-popup>
		
	</view>
</template>

<script>
	import songStore from '@/utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'
	export default {
		data() {
			return {
				showController: false,
				picUrl: '',
				songName: '',
				playStatus: false,
				playingSong: {},
				show: false,
			};
		},
		onShow() {
			this.showController = songStore.getSongList().length > 0;

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
			if (this.playStatus) {
				this.playingSong = songStore.getCurPlayingSong();
			} else {
				this.playingSong = {};
			}
			if (typeof songStore.getCurPlayingSong() != 'undefined') {
				this.picUrl = songStore.getCurPlayingSong().albumUrl;
				this.songName = songStore.getCurPlayingSong().name;
			}
		},
		onHide() {
			bgPlayer.setOnEnded(null);
			bgPlayer.setOnPaused(null);
			bgPlayer.setOnStoped(null);
			bgPlayer.setOnPlayed(null);
		},
		methods: {
			navigateToSearch() {
				uni.navigateTo({
					url: "/pages/SearchSong/SearchSong"
				})
			},
			onClickPlayBtn() {
				if (this.playStatus) {
					bgPlayer.pause();
				} else {
					bgPlayer.replay();
				}
			},
			onClickNextBtn() {
				const nextSong = songStore.getNextSong();
				this.picUrl = nextSong.albumUrl;
				this.songName = nextSong.name;
				bgPlayer.play(nextSong);
			},
			onClickListBtn() {
				this.$refs.popup.open('bottom');
			},
			change(e) {
				this.show = e.show;
			}
		}

	}
</script>

<style lang="scss" scoped>
	.view-container {
		display: flex;
		flex-direction: column;


		.controller-sticky {
			width: 100%;
			position: fixed;
			z-index: 99;
			bottom: 0;
		}
	}
</style>

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
			<playList :playing_song="playingSong" :delete_index="deleteIndex" @onDeleteItemClick="onClickSongDelete"></playList>
		</uni-popup>
		
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog type="info" cancelText="取消" confirmText="确定" title="删除歌曲" :content="deleteInfo"
				@confirm="onDeleteConfirm" ></uni-popup-dialog>
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
				tempDeleteIndex: -1,
				deleteIndex: -1,
				deleteInfo:'',
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
			if (typeof songStore.getCurPlayingSong() != 'undefined') {
				this.picUrl = songStore.getCurPlayingSong().albumUrl;
				this.songName = songStore.getCurPlayingSong().name;
			}
			if (this.playStatus) {
				this.playingSong = songStore.getCurPlayingSong();
			} else {
				this.playingSong = {};
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
				this.deleteIndex = -1;
				this.$refs.popup.open('bottom');
			},
			onClickSongDelete(index){
				this.tempDeleteIndex = index;
				const deleteSong = songStore.getSongByIndex(index);
				this.deleteInfo = '确定要删除\"' + deleteSong.singer + '-' + deleteSong.name + '\"?';
				this.$refs.alertDialog.open()
			},
			onDeleteConfirm(){
				this.deleteIndex = this.tempDeleteIndex;
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

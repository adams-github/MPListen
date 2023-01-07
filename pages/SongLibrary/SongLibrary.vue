<template>
	<page-meta :page-style="'overflow:'+(popupShow?'hidden':'visible')"></page-meta>
	<view class="view-container">
		<view @click="navigateToSearch">
			<uni-search-bar bgColor="#ffffff" placeholder="搜索" radius="40" readonly>
			</uni-search-bar>
		</view>
		<view class="controller-sticky" v-if="showController">
			<MusicController :pic_url="picUrl" :song_name="songName" :play_status="playStatus" :page_show="isShow" @clickPic="onClickPic"
				@clickPlay="onClickPlayBtn" @clickNext="onClickNextBtn" @clickList="onClickListBtn">
			</MusicController>
		</view>
		<uni-popup ref="popup" background-color="#fff" type="bottom" @change="change">
			<PlayList :playing_song="playingSong" :delete_index="deleteIndex" :play_mode="playMode"
				@onItemClick="onClickSongItem" @onDeleteItemClick="onClickSongDelete"></PlayList>
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
	export default {
		data() {
			return {
				showController: false,
				picUrl: '',
				songName: '',
				playStatus: false,
				playingSong: {},
				playMode: 1,
				tempDeleteIndex: -1,
				deleteIndex: -1,
				deleteInfo: '',
				isShow: true,
				popupShow: false,
			};
		},
		onShow() {
			this.isShow = true;
			bgPlayer.setOnPaused(() => {
				this.playStatus = false;
			});
			bgPlayer.setOnStoped(() => {
				this.playStatus = false;
				this.playingSong = {};
			});
			bgPlayer.setOnPlayed(() => {
				this.playStatus = true;
				this.playingSong = songStore.getCurPlayingSong();
				if (typeof this.playingSong != 'undefined' && this.playingSong != null) {
					this.picUrl = this.playingSong.albumUrl;
					this.songName = this.playingSong.name;
				}
			});
			this.playStatus = bgPlayer.isPlaying();
			if ((typeof songStore.getCurPlayingSong()) != 'undefined' && songStore.getCurPlayingSong() != null) {
				this.playingSong = songStore.getCurPlayingSong();
				this.picUrl = this.playingSong.albumUrl;
				this.songName = this.playingSong.name;
				this.showController = true;
			} else {
				this.playingSong = {};
				this.showController = false;
			}
		},
		onHide() {
			this.isShow = false;
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
			onClickPic() {
				if (typeof songStore.getCurPlayingSong() != 'undefined' &&
					songStore.getCurPlayingSong() != null) {
					uni.navigateTo({
						url: "/pages/SongPlay/SongPlay"
					});
				}
			},
			onClickPlayBtn() {
				if (this.playStatus) {
					bgPlayer.pause();
				} else {
					bgPlayer.replay();
				}
			},
			onClickNextBtn() {
				this.playStatus = false;
				const nextSong = songStore.getNextSong();
				if (typeof nextSong != 'undefined' && nextSong != null) {
					this.picUrl = nextSong.albumUrl;
					this.songName = nextSong.name;
					bgPlayer.playSong(nextSong);
				}
			},
			onClickListBtn() {
				this.deleteIndex = -1;
				this.playMode = songStore.getPlayMode();
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
				this.popupShow = e.show;
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
			box-shadow: 0px -5px 10px rgb(245, 245, 245);
		}
	}
</style>

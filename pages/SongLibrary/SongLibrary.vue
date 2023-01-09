<template>
	<page-meta :page-style="'overflow:'+(popupShow?'hidden':'visible')"></page-meta>
	<view class="view-container">
		<view @click="navigateToSearch">
			<uni-search-bar bgColor="#ffffff" placeholder="搜索" radius="40" readonly>
			</uni-search-bar>
		</view>
		<view class="controller-sticky" v-if="showController">
			<MusicController :pic_url="picUrl" :song_name="songName" :play_status="playStatus" :page_show="isShow"
				@clickPic="onClickPic" @clickPlay="onClickPlayBtn" @clickList="onClickListBtn">
			</MusicController>
		</view>
		<uni-popup ref="popup" background-color="#fff" type="bottom" @change="change">
			<PlayList :playing_song="playingSong" :delete_index="deleteIndex" :play_mode="playMode"
				@onDeleteItemClick="onClickSongDelete"></PlayList>
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

	var tempDeleteIndex = -1;
	var hasLoadData = false;

	export default {
		onLoad() {
			songStore.loadAllSongs(() => {
				if ((typeof songStore.getCurPlayingSong()) != 'undefined' &&
					songStore.getCurPlayingSong() != null) {
					this.playingSong = songStore.getCurPlayingSong();
				} else {
					this.playingSong = {};
				}
				hasLoadData = true;
			});
			songStore.loadPlayingSong(() => {
				if ((typeof songStore.getCurPlayingSong()) != 'undefined' &&
					songStore.getCurPlayingSong() != null) {
					this.picUrl = songStore.getCurPlayingSong().albumUrl;
					this.songName = songStore.getCurPlayingSong().name;
					this.showController = true;
				}
			});
			songStore.loadPlayingIndex();
			songStore.loadPlayMode();
		},
		onShow() {
			this.isShow = true;
			this.playStatus = bgPlayer.isPlaying();
			if (hasLoadData) {
				if (this.playStatus) {
					this.playingSong = songStore.getCurPlayingSong();
				} else {
					this.playingSong = {};
				}
			}
			bgPlayer.setOnPaused(() => {
				this.playStatus = false;
				this.playingSong = {};
			});
			bgPlayer.setOnStoped(() => {
				this.playStatus = false;
				this.playingSong = {};
			});
			bgPlayer.setOnErrored(() => {
				this.playStatus = false;
				this.playingSong = {};
			});
			bgPlayer.setOnPlayed(() => {
				this.playStatus = true;
				if (typeof this.playingSong.id === 'undefined') {
					this.playingSong = songStore.getCurPlayingSong();
				}
			});
			bgPlayer.setOnSongChangeCb(() => {
				this.playingSong = songStore.getCurPlayingSong();
				this.picUrl = this.playingSong.albumUrl;
				this.songName = this.playingSong.name;
				//切换歌曲后，为了让头像动画从新开始，所以要设置isShow两次
				this.isShow = false;
				setTimeout(() => {
					this.isShow = true;
				}, 100);
			});
		},
		onHide() {
			this.isShow = false;
			bgPlayer.setOnPaused(null);
			bgPlayer.setOnStoped(null);
			bgPlayer.setOnErrored(null);
			bgPlayer.setOnPlayed(null);
			bgPlayer.setOnSongChangeCb(null);
		},
		data() {
			return {
				showController: false,
				picUrl: '',
				songName: '',
				playStatus: false,
				playingSong: null,
				playMode: 1,
				deleteIndex: -1,
				deleteInfo: '',
				isShow: true,
				popupShow: false,
			};
		},
		methods: {
			navigateToSearch() {
				uni.navigateTo({
					url: "/pages/SearchSong/SearchSong",
					animationType: 'pop-in',
					animationDuration: 100
				})
			},
			onClickPic() {
				if (typeof songStore.getCurPlayingSong() != 'undefined' &&
					songStore.getCurPlayingSong() != null) {
					uni.navigateTo({
						url: "/pages/SongPlay/SongPlay",
						animationType: 'pop-in',
						animationDuration: 100
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
			onClickListBtn() {
				this.deleteIndex = -1;
				this.playMode = songStore.getPlayMode();
				this.$refs.popup.open('bottom');
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

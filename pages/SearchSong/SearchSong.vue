<template>
	<page-meta :page-style="'overflow:'+(show?'hidden':'visible')"></page-meta>
	<view class="view-container">
		<uni-search-bar bgColor="#ffffff" placeholder="输入音乐/歌手" radius="40" @confirm="inputConfirm"
			@cancel="inputCancel"></uni-search-bar>
		<view class="tab-sticky">
			<CommonTabs bgColor="#FAFAFA" :tabsData="tabsData" :defaultIndex="0" @onTabItemClick="onPlatformSelected">
			</CommonTabs>
		</view>

		<view class="list_content" :class="{'list_content-margin' : showController === true}">
			<scroll-view scroll-y scroll-with-animation>
				<view>
					<block v-for="(item, index) in songList" :key="index">
						<view class="item-box" hover-class="item-hover" @click="itemClick(item)">
							<text class="item-songname"
								:class="{'item-songname-vip' : item.isFree != true}">{{item.name}}</text>
							<text class="item-songInfo" :class="{'item-songInfo-vip' : item.isFree != true}">
								{{item.singer + (item.albumName != ''? ' -' + '《' + item.albumName + '》' : '')}}</text>
						</view>
					</block>
				</view>
				<uni-load-more :status="loadMoreStatus" iconType="auto" :contentText="loadMoreText"
					@clickLoadMore="search(1)" v-show="isShowLoadMore"></uni-load-more>
			</scroll-view>
		</view>

		<view class="controller-sticky" v-show="showController">
			<MusicController :pic_url="picUrl" :song_name="songName" :play_status="playStatus" @clickPic="onClickPic"
				@clickPlay="onClickPlayBtn" @clickNext="onClickNextBtn" @clickList="onClickListBtn">

			</MusicController>
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
	import qqJs from '@/api/qq.js'
	import kugouJs from '@/api/kugou.js'
	import kuwoJs from '@/api/kuwo.js'
	import neteaseJs from '@/api/netease.js'
	import miguJs from '@/api/migu.js'

	import songStore from '@/utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'

	export default {
		data() {
			return {
				tabsData: [{
						"label": "酷我音乐",
						"id": 0
					},
					{
						"label": "酷狗音乐",
						"id": 1
					},
					{
						"label": "QQ音乐",
						"id": 2
					},
					{
						"label": "网易云音乐",
						"id": 3
					},
					{
						"label": "咪咕音乐",
						"id": 4
					},
				],
				inputText: "",
				isRefreshing: false,
				isLoadingSong: false,
				isShowLoadMore: false,
				loadMoreStatus: 'more',
				loadMoreText: {
					contentdown: '点击加载更多',
					contentrefresh: '拼命加载中',
					contentnomore: '已经到底了'
				},
				platformIndex: 0,
				neteaseCurPage: 1,
				qqCurPage: 1,
				kugouCurPage: 1,
				kuwoCurPage: 1,
				miguCurPage: 1,
				songList: [],
				showController: false,
				picUrl: '',
				songName: '',
				playStatus: false,
				playingSong: {},
				tempDeleteIndex: -1,
				deleteIndex: -1,
				deleteInfo: '',
				show: false,
			};
		},
		onLoad() {
			this.showController = songStore.getSongList().length > 0;
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
		onBackPress() {
			uni.hideNavigationBarLoading();
			uni.hideLoading();
		},
		methods: {
			inputConfirm(res) {
				this.inputCancel();
				this.inputText = res.value;
				this.search(0);
			},
			inputCancel() {
				this.inputText = '';
				this.songList = [];
				this.neteaseCurPage = 1;
				this.qqCurPage = 1;
				this.kugouCurPage = 1;
				this.kuwoCurPage = 1;
				this.miguCurPage = 1;
			},
			search(val) {
				let label = this.inputText;
				if (label === '') return;

				if (val == 0) {
					this.isRefreshing = true;
					uni.showNavigationBarLoading();
				} else {
					this.loadMoreStatus = 'loading';
				}
				switch (this.platformIndex) {
					case 0:
						this.exceKuwoSearch(label);
						break;
					case 1:
						this.exceKugouSearch(label);
						break;
					case 2:
						this.exceQQSearch(label);
						break;
					case 3:
						this.exceNeteaseSearch(label);
						break;
					case 4:
						this.exceMiguSearch(label);
						break;
				}
			},
			onPlatformSelected(val) {
				uni.hideNavigationBarLoading()
				this.songList = [];
				this.platformIndex = val;
				this.search(0);
			},
			exceQQSearch(label) {
				if (this.isRefreshing) {
					this.qqCurPage = 1;
				} else {
					this.qqCurPage++;
				}
				qqJs.qqSearch(label, this.qqCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			exceKugouSearch(label) {
				if (this.isRefreshing) {
					this.kugouCurPage = 1;
				} else {
					this.kugouCurPage++;
				}
				kugouJs.kugouSearch(label, this.kugouCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			exceKuwoSearch(label) {
				if (this.isRefreshing) {
					this.kuwoCurPage = 1;
				} else {
					this.kuwoCurPage++;
				}

				kuwoJs.kuwoSearchForWX(label, this.kuwoCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			exceNeteaseSearch(label) {
				if (this.isRefreshing) {
					this.neteaseCurPage = 1;
				} else {
					this.neteaseCurPage++;
				}
				neteaseJs.neteaseSearch(label, this.neteaseCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					if (error == -462) {
						this.exceNeteaseSearch(label);
					} else {
						this.requestError(error);
					}
				});
			},
			exceMiguSearch(label) {
				if (this.isRefreshing) {
					this.miguCurPage = 1;
				} else {
					this.miguCurPage++;
				}
				miguJs.miguSearch(label, this.miguCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			requestListSuccess(data) {
				if (this.isRefreshing) {
					this.isRefreshing = false;
					uni.hideNavigationBarLoading();
				}
				this.songList = this.songList.concat(data);
			},
			requestError(error) {
				uni.showToast({
					title: error,
					icon: 'none',
					position: 'bottom'
				});
				if (this.isRefreshing) {
					this.isRefreshing = false;
					uni.hideNavigationBarLoading();
				}
				if (this.isLoadingSong) {
					this.isLoadingSong = false;
					uni.hideLoading();
				}
				if (this.loadMoreStatus === 'loading') {
					this.loadMoreStatus = 'more';
				}
			},
			itemClick(item) {
				if (item.isFree != true) {
					uni.showToast({
						title: '需要VIP或没有音源',
						icon: 'none',
						position: 'bottom'
					});
					return;
				}

				uni.showLoading();
				switch (this.platformIndex) {
					case 0:
						this.kuwoSongUrl(item);
						break;
					case 1:
						this.kugouSongData(item);
						break;
					case 2:
						this.qqSongUrl(item);
						break;
					case 3:
						this.neteaseSongUrl(item);
						break;
					case 4:
						this.miguSongUrl(item);
						break;
				}
			},

			kuwoSongUrl(item) {
				//获取图片url, 再获取歌曲url
				kuwoJs.kuwoSongInfo(item.id, (data) => {
					item.albumUrl = data.img;
					kuwoJs.kuwoSongUrl(item.id, (data) => {
						this.requestSongUrlSuccess(item, data);
					}, (error) => {
						this.requestError(error);
					});
				}, (error) => {
					this.requestError(error);
				});
			},
			qqSongUrl(item) {
				qqJs.qqSongUrl(item.id, (data) => {
					this.requestSongUrlSuccess(item, data);
				}, (error) => {
					this.requestError(error);
				});
			},
			kugouSongData(item) {
				kugouJs.kugouSongData(item.id, item.albumId, (data) => {
					item.albumUrl = data.img;
					this.requestSongUrlSuccess(item, data.url);
				}, (error) => {
					this.requestError(error);
				});
			},
			miguSongUrl(item) {
				miguJs.miguSongUrl(item.id, item.quality, (data) => {
					this.requestSongUrlSuccess(item, data);
				}, (error) => {
					this.requestError(error);
				});
			},
			neteaseSongUrl(item) {
				neteaseJs.neteaseSongUrl(item.id, (data) => {
					this.requestSongUrlSuccess(item, data);
				}, (error) => {
					if (error == -462) {
						this.neteaseSongUrl(item);
					} else {
						this.requestError(error);
					}
				});
			},
			requestSongUrlSuccess(item, data) {
				this.isLoadingSong = false;
				uni.hideLoading();
				item.url = data;
				songStore.addSong(item);
				if (!this.showController) {
					this.showController = true;
				}
				this.picUrl = item.albumUrl;
				this.songName = item.name;
				bgPlayer.play(item);
			},
			onClickPic() {
				if (typeof songStore.getCurPlayingSong() != 'undefined' &&
					songStore.getCurPlayingSong() != null) {
					uni.navigateTo({
						url: "/pages/SongDetail/SongDetail"
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
				this.picUrl = nextSong.albumUrl;
				this.songName = nextSong.name;
				bgPlayer.play(nextSong);
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

		},
		watch: {
			songList: {
				immediate: true,
				handler(val) {
					this.isShowLoadMore = val.length > 0;
					if (val.length % 20 === 0) {
						this.loadMoreStatus = 'more';
					} else {
						this.loadMoreStatus = 'noMore';
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	.view-container {
		display: flex;
		flex-direction: column;

		.tab-sticky {
			position: sticky;
			z-index: 99;
			top: 0;
			display: flex;
			flex-direction: column;
			box-shadow: 0px 20px 20px rgb(240, 240, 240);
		}

		.list_content {
			margin: 10px 0;

			.item-box {
				display: flex;
				flex-direction: column;
				padding: 10px 15px;

				.item-songname {
					color: #22D59C;
					font-size: 16px;

					&-vip {
						color: #c7c7c7;
					}
				}

				.item-songInfo {
					color: #7d7d7d;
					font-size: 13px;
					margin-top: 3px;

					&-vip {
						color: #c7c7c7;
					}
				}
			}

			.item-hover {
				background-color: #F0F0F0;
			}

			&-margin {
				margin: 10px 0 50px;
			}
		}

		.controller-sticky {
			width: 100%;
			position: fixed;
			z-index: 99;
			bottom: 0;
			box-shadow: 0px -5px 10px rgb(245, 245, 245);
		}
	}
</style>

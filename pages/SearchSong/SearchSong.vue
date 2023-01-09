<template>
	<page-meta :page-style="'overflow:'+(popupShow?'hidden':'visible')"></page-meta>
	<view class="view-container">
		<view class="top-content">
			<uni-search-bar bgColor="#ffffff" placeholder="输入音乐/歌手" radius="40" @confirm="inputConfirm"
				@cancel="inputCancel"></uni-search-bar>
			<CommonTabs bgColor="#FAFAFA" :tabsData="tabsData" @onTabItemClick="onPlatformSelected">
			</CommonTabs>
		</view>
		<view class="list-content" :class="{'list-content-margin' : showController}">
			<scroll-view id="_scrollview" style="-webkit-overflow-scrolling: touch;"
				:style="{height: scrollViewHeight + 'px'}" scroll-y scroll-with-animation enable-back-to-top>
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
		<view id="_controller" class="controller-sticky" v-if="showController">
			<MusicController :pic_url="picUrl" :song_name="songName" :play_status="playStatus" :page_show="isShow"
				@clickPic="onClickPic" @clickPlay="onClickPlayBtn" @clickList="onClickListBtn">
			</MusicController>
		</view>
		<uni-popup ref="popup" background-color="#fff" @change="change">
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
	import qqJs from '@/api/qq.js'
	import kugouJs from '@/api/kugou.js'
	import kuwoJs from '@/api/kuwo.js'
	import neteaseJs from '@/api/netease.js'
	import miguJs from '@/api/migu.js'

	import songStore from '@/utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'

	var inputText = '';
	var isRefreshing = false;
	var isLoadingSong = false;
	var platformIndex = 0;
	var neteaseCurPage = 1;
	var qqCurPage = 1;
	var kugouCurPage = 1;
	var kuwoCurPage = 1;
	var miguCurPage = 1;
	var tempDeleteIndex = -1;
	var windowHeight = 0;
	var scrollViewTop = 0;
	var controllTop = 0;
	var isIOS = false;

	export default {
		onLoad() {
			/*
			 * 兼容ios平台小程序点击状态栏滚动顶部
			 * ios平台坑就坑在scrollview不设置固定固定的高度，点击状态栏就没办法自动滚动顶部
			 */
			uni.getSystemInfo({
				success: function(res) {
					isIOS = res.osName == 'ios';
					if (isIOS) {
						windowHeight = res.windowHeight;
					}
				}
			});
		},
		onReady() {
			/*
			 * 兼容ios平台小程序点击状态栏滚动顶部
			 * ios平台坑就坑在scrollview不设置固定固定的高度，点击状态栏就没办法自动滚动顶部
			 */
			if (isIOS) {
				uni.createSelectorQuery().in(this).select('#_scrollview')
					.boundingClientRect((res) => {
						scrollViewTop = res.top;
						if (this.showController) {
							uni.createSelectorQuery().in(this).select('#_controller')
								.boundingClientRect((res) => {
									controllTop = res.top;
									this.scrollViewHeight = controllTop - scrollViewTop;
								}).exec();
						} else {
							this.scrollViewHeight = windowHeight - scrollViewTop;
						}
					}).exec();
			}
		},
		onShow() {
			if (!this.isShow) {
				this.isShow = true;
			}
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

			bgPlayer.setOnPaused(() => {
				this.playStatus = false;
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
		onUnload() {
			inputText = '';
			isRefreshing = false;
			isLoadingSong = false;
			platformIndex = 0;
			neteaseCurPage = 1;
			qqCurPage = 1;
			kugouCurPage = 1;
			kuwoCurPage = 1;
			miguCurPage = 1;
		},
		onBackPress(options) {
			// #ifdef APP-PLUS || MP-ALIPAY || H5
			if (isLoadingSong) {
				uni.hideLoading();
				return true;
			} else if (this.popupShow) {
				this.$refs.popup.close();
				return true;
			} else {
				uni.hideNavigationBarLoading();
			}
			// #endif
		},
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

				scrollViewHeight: 0,
				isShowLoadMore: false,
				loadMoreStatus: 'more',
				loadMoreText: {
					contentdown: '点击加载更多',
					contentrefresh: '拼命加载中',
					contentnomore: '已经到底了'
				},

				songList: [],
				showController: false,
				picUrl: '',
				songName: '',
				playStatus: false,
				playingSong: {},
				playMode: 1,

				deleteIndex: -1,
				deleteInfo: '',
				isShow: true,
				popupShow: false,
			};
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
					/**
					 * 不是安卓平台可以随意设置动态高度，点击标题栏也可以滚到顶部
					 * */
					if (!isIOS) {
						this.scrollViewHeight = val.length * 60 + (this.isShowLoadMore ? 40 : 0);
					}
				}
			}
		},
		methods: {
			inputConfirm(res) {
				this.inputCancel();
				inputText = res.value;
				this.search(0);
			},
			inputCancel() {
				inputText = '';
				this.songList = [];
				neteaseCurPage = 1;
				qqCurPage = 1;
				kugouCurPage = 1;
				kuwoCurPage = 1;
				miguCurPage = 1;
			},
			search(val) {
				if (this.loadMoreStatus == 'noMore') return;
				let label = inputText;
				if (label === '') return;

				if (val == 0) {
					isRefreshing = true;
					uni.showNavigationBarLoading();
				} else {
					this.loadMoreStatus = 'loading';
				}
				switch (platformIndex) {
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
				this.loadMoreStatus = 'more';
				platformIndex = val;
				this.search(0);
			},
			exceQQSearch(label) {
				if (isRefreshing) {
					qqCurPage = 1;
				} else {
					qqCurPage++;
				}
				qqJs.qqSearch(label, qqCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			exceKugouSearch(label) {
				if (isRefreshing) {
					kugouCurPage = 1;
				} else {
					kugouCurPage++;
				}
				kugouJs.kugouSearch(label, kugouCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			exceKuwoSearch(label) {
				if (isRefreshing) {
					kuwoCurPage = 1;
				} else {
					kuwoCurPage++;
				}

				kuwoJs.kuwoSearchForMPWX(label, kuwoCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			exceNeteaseSearch(label) {
				if (isRefreshing) {
					neteaseCurPage = 1;
				} else {
					neteaseCurPage++;
				}
				neteaseJs.neteaseSearch(label, neteaseCurPage, (data) => {
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
				if (isRefreshing) {
					miguCurPage = 1;
				} else {
					miguCurPage++;
				}
				miguJs.miguSearch(label, miguCurPage, (data) => {
					this.requestListSuccess(data);
				}, (error) => {
					this.requestError(error);
				});
			},
			requestListSuccess(data) {
				if (isRefreshing) {
					isRefreshing = false;
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
				if (isRefreshing) {
					isRefreshing = false;
					uni.hideNavigationBarLoading();
				}
				if (isLoadingSong) {
					isLoadingSong = false;
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
				uni.showLoading({
					mask: true
				});
				switch (platformIndex) {
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
				kuwoJs.kuwoSongUrl(item.id, (data) => {
					this.requestSongUrlSuccess(item, data);
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
					item.lyricUrl = item.lyricUrl.replace('http:', 'https:');
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
				isLoadingSong = false;
				uni.hideLoading();

				item.url = data;
				item.urlTime = Date.now();
				this.picUrl = item.albumUrl;
				this.songName = item.name;
				songStore.recordSong(item);
				bgPlayer.playSong(item);
				if (!this.showController) {
					this.showController = true;
					if (isIOS) {
						this.scrollViewHeight -= 40;
					}
				}
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
				tempDeleteIndex = index;
				const deleteSong = songStore.getSongByIndex(index);
				this.deleteInfo = '确定要删除\"' + deleteSong.singer + '-' + deleteSong.name + '\"?';
				this.$refs.alertDialog.open()
			},
			onDeleteConfirm() {
				this.deleteIndex = tempDeleteIndex;
			},
			change(e) {
				this.popupShow = e.show;
			}
		}
	}
</script>

<style lang="scss">
	.view-container {
		display: flex;
		flex-direction: column;

		.top-content {
			position: sticky;
			z-index: 99;
			top: 0px;
			background-color: #FAFAFA;
			box-shadow: 0px 20px 20px rgb(240, 240, 240);
		}

		.list-content {
			margin: 10px 0;

			.item-box {
				height: 60px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: 0 15px;

				.item-songname {
					color: #22D59C;
					font-size: 16px;
					max-width: 100%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;

					&-vip {
						color: #c7c7c7;
					}
				}

				.item-songInfo {
					color: #7d7d7d;
					font-size: 13px;
					margin-top: 3px;
					max-width: 100%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;

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

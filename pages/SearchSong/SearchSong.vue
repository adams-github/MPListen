<template>
	<view class="view-container">
		<uni-search-bar bgColor="#ffffff" placeholder="输入音乐/歌手" radius="40" @confirm="inputConfirm"
			@cancel="inputCancel"></uni-search-bar>
		<view class="tab-sticky">
			<CommonTabs bgColor="#FAFAFA" :tabsData="tabsData" :defaultIndex="0" @onTabItemClick="onPlatformSelected">
			</CommonTabs>
			<view class="divide-line"></view>
		</view>

		<view class="list_content">
			<scroll-view scroll-y scroll-with-animation>
				<view>
					<block v-for="(item, index) in songList" :key="index">
						<view class="item-box" hover-class="item-hover" @click="itemClick(item)">
							<text style="color: #22D59C; font-size: 16px;">{{item.name}}</text>
							<text style="color: #7d7d7d; font-size: 13px; margin-top: 3px;">
								{{item.singer + (item.albumName != ''? ' -' + '《' + item.albumName + '》' : '')}}</text>
						</view>
					</block>
				</view>
				<uni-load-more :status="loadMoreStatus" iconType="auto" :contentText="loadMoreText"
					@clickLoadMore="search(1)" v-show="isShowLoadMore"></uni-load-more>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import qqJs from '@/api/qq.js'
	import kugouJs from '@/api/kugou.js'
	import kuwoJs from '@/api/kuwo.js'
	// import neteaseJs from '@/api/netease.js'
	// import miguJs from '@/api/migu.js'

	import bgMp3Player from '@/utils/bgPlayer.js'

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
						"label": "咪咕音乐",
						"id": 3
					},
					{
						"label": "网易云音乐",
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
				songList: []
			};
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
						this.exceMiguSearch(label);
						break;
					case 4:
						this.exceNeteaseSearch(label);
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
				// neteaseJs.neteaseSearch(label, this.neteaseCurPage, (data) => {
				// 	this.requestListSuccess(data);
				// }, (error) => {
				// 	this.requestError(error);
				// });
			},
			exceMiguSearch(label) {
				if (this.isRefreshing) {
					this.miguCurPage = 1;
				} else {
					this.miguCurPage++;
				}
				// miguJs.miguSearch(label, this.miguCurPage, (data) => {
				// 	this.requestListSuccess(data);
				// }, (error) => {
				// 	this.requestError(error);
				// });
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
						this.miguSongUrl(item);
						break;
					case 4:
						this.neteaseSongUrl(item);
						break;
				}
			},

			kuwoSongUrl(item) {
				kuwoJs.kuwoSongUrl(item.id, (data) => {
					console.log(data);
					this.isLoadingSong = false;
					uni.hideLoading();
					item.url = data;
					bgMp3Player.play(item);
				}, (error) => {
					this.requestError(error);
				});
			},
			qqSongUrl(item) {
				qqJs.qqSongUrl(item.id, (data) => {
					console.log(data);
					this.isLoadingSong = false;
					uni.hideLoading();
					item.url = data;
					bgMp3Player.play(item);
				}, (error) => {
					this.requestError(error);
				});
			},
			kugouSongData(item) {
				kugouJs.kugouSongData(item.id, item.albumId, (data) => {
					console.log(data.url);
					this.isLoadingSong = false;
					uni.hideLoading();
					item.url = data;
					bgMp3Player.play(item);
				}, (error) => {
					this.requestError(error);
				});
			},
			miguSongUrl(item) {
				// miguJs.miguSongUrl(item.id, (data) => {
				// 	console.log(data);
				// 	this.isLoadingSong = false;
				// 	uni.hideLoading();
				//  item.url = data;
				// 	bgMp3Player.play(item);
				// }, (error) => {
				// 	this.requestError(error);
				// });
			},
			neteaseSongUrl(item) {
				// neteaseJs.neteaseSongUrl(item.id, (data) => {
				// 	console.log(data);
				// 	this.isLoadingSong = false;
				// 	uni.hideLoading();
				//  item.url = data;
				// 	bgMp3Player.play(item);
				// }, (error) => {
				// 	this.requestError(error);
				// });
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

			.divide-line {
				width: 100%;
				height: 1px;
				background-color: #F0F0F0;
			}
		}

		.list_content {
			margin: 10px 0;

			.item-box {
				display: flex;
				flex-direction: column;
				padding: 10px 15px;

			}

			.item-hover {
				background-color: #F0F0F0;
			}
		}
	}
</style>

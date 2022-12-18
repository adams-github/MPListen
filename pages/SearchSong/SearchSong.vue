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
	import {
		neteaseSearch
	} from '@/api/netease.js'
	import {
		qqSearch
	} from '@/api/qq.js'
	import {
		kugouSearch
	} from '@/api/kugou.js'
	import {
		kuwoSearch
	} from '@/api/kuwo.js'
	import {
		miguSearch
	} from '@/api/migu.js'

	export default {
		data() {
			return {
				tabsData: [{
						"label": "网易云音乐",
						"id": 0
					},
					{
						"label": "QQ音乐",
						"id": 1
					},
					{
						"label": "酷狗音乐",
						"id": 2
					},
					// {
					// 	"label": "酷我音乐",
					// 	"id": 3
					// },
					{
						"label": "咪咕音乐",
						"id": 3
					},
					// {
					// 	"label": "哔哩哔哩",
					// 	"id": 5
					// }
				],
				inputText: "",
				isRefreshing: false,
				isShowLoadMore: false,
				loadMoreStatus: 'more',
				loadMoreText: {
					contentdown: '点击加载更多',
					contentrefresh: '拼命加载中',
					contentnomore: '别点了, 只有这么多了'
				},
				platformIndex: 0,
				neteaseCurPage: 1,
				qqCurPage: 1,
				kugouCurPage: 1,
				kuwoCurPage: 1,
				miguCurPage: 1,
				songList: [],
				neteaseSongList: [],
				qqSongList: [],
				kugouSongList: [],
				kuwoSongList: [],
				miguSongList: [],
				// bilibiliSongList: []
			};
		},
		onBackPress() {
			uni.hideNavigationBarLoading();
		},
		methods: {
			inputConfirm(res) {
				this.inputText = res.value;
				this.search(0);
			},
			inputCancel() {
				this.inputText = '';
				this.songList = [];
				this.neteaseSongList = [];
				this.qqSongList = [];
				this.kugouSongList = [];
				this.kuwoSongList = [];
				this.miguSongList = [];
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
						this.exceNeteaseSearch(label);
						break;
					case 1:
						this.exceQQSearch(label);
						break;
					case 2:
						this.exceKugouSearch(label);
						break;
					case 3:
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
			exceNeteaseSearch(label) {
				if (this.isRefreshing) {
					this.neteaseCurPage = 1;
				} else {
					this.neteaseCurPage++;
				}
				neteaseSearch(label, this.neteaseCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.neteaseSongList = data;
					} else {
						this.neteaseSongList = this.neteaseSongList.concat(data);
					}
					this.songList = this.neteaseSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceQQSearch(label) {
				if (this.isRefreshing) {
					this.qqCurPage = 1;
				} else {
					this.qqCurPage++;
				}
				qqSearch(label, this.qqCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.qqSongList = data;
					} else {
						this.qqSongList = this.qqSongList.concat(data);
					}
					this.songList = this.qqSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceKugouSearch(label) {
				if (this.isRefreshing) {
					this.kugouCurPage = 1;
				} else {
					this.kugouCurPage++;
				}
				kugouSearch(label, this.kugouCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.kugouSongList = data;
					} else {
						this.kugouSongList = this.kugouSongList.concat(data);
					}
					this.songList = this.kugouSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceKuwoSearch(label) {
				if (this.isRefreshing) {
					this.kuwoCurPage = 1;
				} else {
					this.kuwoCurPage++;
				}
				kuwoSearch(label, this.kuwoCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.kuwoSongList = data;
					} else {
						this.kuwoSongList = this.kuwoSongList.concat(data);
					}
					this.songList = this.kuwoSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceMiguSearch(label) {
				if (this.isRefreshing) {
					this.miguCurPage = 1;
				} else {
					this.miguCurPage++;
				}
				miguSearch(label, this.miguCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.miguSongList = data;
					} else {
						this.miguSongList = this.miguSongList.concat(data);
					}
					this.songList = this.miguSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			searchError(error) {
				uni.showToast({
					title: error,
					icon: 'none',
					position: 'bottom'
				});
				if (this.isRefreshing) {
					this.isRefreshing = false;
					uni.hideNavigationBarLoading();
				}
			},
			itemClick(item) {
				console.log(item.name);
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

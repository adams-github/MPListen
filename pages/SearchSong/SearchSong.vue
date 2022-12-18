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
				this.search(res.value);
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
			search(label) {
				if (label === '') return;

				this.isRefreshing = true;
				uni.showNavigationBarLoading();
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
				this.search(this.inputText);
			},
			exceNeteaseSearch(label) {
				if (this.isRefreshing) {
					this.neteaseCurPage = 1;
				}
				neteaseSearch(label, this.neteaseCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.neteaseSongList = data;
					} else {
						let templist = this.neteaseSongList;
						const resultList = templist.contact(data);
						this.neteaseSongList = resultList;
						this.neteaseCurPage++;
					}
					this.songList = this.neteaseSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceQQSearch(label) {
				if (this.isRefreshing) {
					this.qqCurPage = 1;
				}
				qqSearch(label, this.qqCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.qqSongList = data;
					} else {
						let templist = this.qqSongList;
						const resultList = templist.contact(data);
						this.qqSongList = resultList;
						this.qqCurPage++;
					}
					this.songList = this.qqSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceKugouSearch(label) {
				if (this.isRefreshing) {
					this.kugouCurPage = 1;
				}
				kugouSearch(label, this.kugouCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.kugouSongList = data;
					} else {
						let templist = this.kugouSongList;
						const resultList = templist.contact(data);
						this.kugouSongList = resultList;
						this.kugouCurPage++;
					}
					this.songList = this.kugouSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceKuwoSearch(label) {
				if (this.isRefreshing) {
					this.kuwoCurPage = 1;
				}
				kuwoSearch(label, this.kuwoCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.kuwoSongList = data;
					} else {
						let templist = this.kuwoSongList;
						const resultList = templist.contact(data);
						this.kuwoSongList = resultList;
						this.kuwoCurPage++;
					}
					this.songList = this.kuwoSongList;
				}, (error) => {
					this.searchError(error);
				});
			},
			exceMiguSearch(label) {
				if (this.isRefreshing) {
					this.miguCurPage = 1;
				}
				miguSearch(label, this.miguCurPage, (data) => {
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.miguSongList = data;
					} else {
						let templist = this.miguSongList;
						const resultList = templist.contact(data);
						this.miguSongList = resultList;
						this.miguCurPage++;
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

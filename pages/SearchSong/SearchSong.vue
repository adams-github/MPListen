<template>
	<view class="view-container">
		<uni-search-bar bgColor="#ffffff" placeholder="输入音乐/歌手" radius="40" @confirm="inputConfirm"></uni-search-bar>
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
							<text style="color: #22D59C; font-size: 13px;">{{item.name}}</text>
							<text style="color: #7d7d7d; font-size: 13px; margin-top: 3px;">
								{{item.singer + ' · ' + item.albumName}}</text>
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
	} from '@/api/netease.js';
	import {
		kugouSearch
	} from '@/api/kugou.js'
	import {
		kuwoSearch
	} from '@/api/kuwo.js'
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
					// {
					// 	"label": "咪咕音乐",
					// 	"id": 4
					// },
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
				songList: [],
				neteaseSongList: [],
				qqSongList: [],
				kugouSongList: [],
				kuwoSongList: [],
				// miguSongList: [],
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
						this.exceKuwoSearch(label);
						break;
						// case 4:
						// 	console.log(label);
						// 	break;
						// case 5:
						// 	console.log(label);
						// 	break;
				}
			},
			onPlatformSelected(val) {
				if (this.platformIndex != val) {
					uni.hideNavigationBarLoading()
					this.songList = [];
					this.platformIndex = val;
					this.search(this.inputText);
				}
			},
			exceNeteaseSearch(label) {
				neteaseSearch(label, this.neteaseCurPage, (data) => {
					console.log(data);
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.neteaseSongList = data;
					} else {
						let templist = this.neteaseSongList;
						const resultList = templist.contact(data);
						this.neteaseSongList = resultList;
					}
					this.songList = this.neteaseSongList;
				}, (error) => {
					uni.showToast({
						title: error,
						icon: 'none',
						position: 'bottom'
					});
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
					}
				});
			},
			exceQQSearch(label) {

			},
			exceKugouSearch(label) {
				kugouSearch(label, this.kugouCurPage, (data) => {
					console.log(data);
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.kugouSongList = data;
					} else {
						let templist = this.kugouSongList;
						const resultList = templist.contact(data);
						this.kugouSongList = resultList;
					}
					this.songList = this.kugouSongList;
				}, (error) => {
					uni.showToast({
						title: error,
						icon: 'none',
						position: 'bottom'
					});
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
					}
				});
			},
			exceKuwoSearch(label) {
				kuwoSearch(label, this.kuwoCurPage, (data) => {
					console.log(data);
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
						this.kuwoSongList = data;
					} else {
						let templist = this.kuwoSongList;
						const resultList = templist.contact(data);
						this.kuwoSongList = resultList;
					}
					this.songList = this.kuwoSongList;
				}, (error) => {
					uni.showToast({
						title: error,
						icon: 'none',
						position: 'bottom'
					});
					if (this.isRefreshing) {
						this.isRefreshing = false;
						uni.hideNavigationBarLoading();
					}
				});
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

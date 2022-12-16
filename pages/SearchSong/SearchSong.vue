<template>
	<view class="view-container">
		<uni-search-bar bgColor="#ffffff" placeholder="输入音乐/歌手" radius="40" @confirm="inputConfirm"></uni-search-bar>
		<CommonTabs :tabsData="tabsData" :defaultIndex="0" @onTabItemClick="onPlatformSelected"></CommonTabs>
		<uni-list></uni-list>
	</view>
</template>

<script>
	import {
		neteaseSearch
	} from '@/api/netease.js';
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
					{
						"label": "酷我音乐",
						"id": 3
					},
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
				neteaseSongList: [],
				qqSongList: [],
				kugouSongList: [],
				kuwoSongList: [],
				miguSongList: [],
				bilibiliSongList: []
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

			},
			exceKuwoSearch(label) {

			},
		},
	}
</script>

<style lang="scss">
	.view-container {}
</style>

<template>
	<view class="view-container">
		<uni-search-bar bgColor="#ffffff" placeholder="输入音乐/歌手" radius="40" @confirm="search"></uni-search-bar>
		<CommonTabs :tabsData="tabsData" :defaultIndex="0" @onTabItemClick="onPlatformSelected"></CommonTabs>
		<uni-list></uni-list>
	</view>
</template>

<script>
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
					{
						"label": "咪咕音乐",
						"id": 4
					},
					{
						"label": "哔哩哔哩",
						"id": 5
					}
				],
				inputText: "",
				platformIndex: 0
			};
		},
		methods: {
			search(res) {
				switch (this.platformIndex) {
					case 0:
						console.log(res.value);
						break;
					case 1:
						console.log(res.value);
						break;
					case 2:
						console.log(res.value);
						break;
					case 3:
						console.log(res.value);
						break;
					case 4:
						console.log(res.value);
						break;
					case 5:
						console.log(res.value);
						break;
				}
			},
			onPlatformSelected(val) {
				this.platformIndex = val;
			}
		}
	}
</script>

<style lang="scss">
	.view-container {}
</style>

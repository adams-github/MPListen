<template>
	<view class="view-container">
		<view class="search-box">
			<CommonSearch></CommonSearch>
		</view>

		<CommonTabs :tabsData="tabsData" :defaultIndex="0"></CommonTabs>
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
				]
			};
		}
	}
</script>

<style lang="scss">
	.view-container {

		.search-box {
			padding: 0 20px;
			margin: 5px 0px 10px;
		}
	}
</style>

<template>
	<view class="view-container">
		<view class="search-box">
			<CommonSearch></CommonSearch>
		</view>

		<CommonTabs :tabsData="tabsData"></CommonTabs>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabsData: [{
						"label": "网易云",
						"id": 0
					},
					{
						"label": "QQ",
						"id": 1
					},
					{
						"label": "酷狗",
						"id": 2
					},
					{
						"label": "酷我",
						"id": 3
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
			margin: 15px 0;
		}
	}
</style>

<template>
	<view class="view-container">
		<view @click="navigateToSearch">
			<uni-search-bar bgColor="#ffffff" placeholder="搜索" radius="40" readonly>
			</uni-search-bar>
		</view>

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
			};
		},
		methods: {
			navigateToSearch() {
				uni.navigateTo({
					url: "/pages/SearchSong/SearchSong"
				})
			},
			onPlatformSelected(val) {

			}
		}

	}
</script>

<style lang="scss" scoped>
	.view-container {
		display: flex;
		flex-direction: column;

	}
</style>

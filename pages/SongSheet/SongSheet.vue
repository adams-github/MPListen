<template>
	<view class="view-container">
		<view class="search-box" @click="navigateToSearch()">
			<CommonSearch></CommonSearch>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		},
		methods: {
			navigateToSearch() {
				uni.navigateTo({
					url: "/pages/SearchSong/SearchSong"
				})
			}
		}

	}
</script>

<style lang="scss" scoped>
	.view-container {

		.search-box {
			padding: 0 20px;
			margin: 15px 0;
		}
	}
</style>

<template>
	<view class="search-container">
		<view class="search-box">
			<image class="search-icon" src="../../static/ic_main_search.png"></image>
			<text class="search-text">{{placeHolderText}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: "CommonSearch",
		props: {
			placeHolderText: {
				type: String,
				default: "搜索"
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>
	$uni-img-size-sm:20px;

	.search-container {
		display: flex;
		align-items: center;

		.search-box {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 28px;
			padding: 0 $uni-spacing-sm;
			background-color: $uni-white;
			border-radius: 14px;
			border: 1px solid $uni-white;

			.search-icon {
				width: $uni-img-size-sm;
				height: $uni-img-size-sm;
			}

			.search-text {
				font-size: 15px;
				margin-left: 5px;
				color: #8a8a8a;
			}
		}
	}
</style>

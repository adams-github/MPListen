<template>
	<view class="tab-container">
		<view class="tab-box">
			<scroll-view class="scroll-v" scroll-x scroll-with-animation >
				<view class="srcoll-content">
					<view class="tab-item-box">
						<block v-for="(item, index) in tabsData" :key="index">
							<view class="tab-item" :class="{'tab-item-active' : activeIndex === index}"
								@click="onTabItemClick(index)">
								{{ item.label }}
							</view>
						</block>
					</view>
					<view class="underLine" :style="{ transform: 'translateX(' + slider.left + 'px)' }"></view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "CommonTabs",
		props: {
			tabsData: {
				type: Array,
				default: () => {
					return [];
				}
			},
			defaultIndex: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				activeIndex: -1,
				slider: {
					left: 0
				}
			};
		},
		watch: {
			defaultIndex: {
				immediate: true,
				handler(val) {
					this.activeIndex = val;
				}
			}
		},
		methods: {
			onTabItemClick(val) {
				this.activeIndex = val;
			},
			onScrollH(event) {
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tab-container {
		width: 100%;
		height: 40px;

		.tab-box {
			width: 100%;
			height: 40px;
			display: flex;
			position: relative;

			.scroll-v {
				width: 100%;
				height: 100%;
				white-space: nowrap;
				box-sizing: border-box;

				.srcoll-content {
					width: 100%;
					height: 100%;
					position: relative;

					.tab-item-box {

						height: 100%;

						.tab-item {
							height: 100%;
							display: inline-block;
							position: relative;
							text-align: center;
							padding: 0 15px;
							color: $uni-base-color;

							&-active {
								color: $uni-primary;
								font-weight: bold;
							}
						}
					}

					.underLine {
						width: 24px;
						height: 2px;
						background-color: $uni-primary;
						border-radius: 1px;
						transition: 0.5s;
						position: absolute;
						bottom: 0;
					}
				}

			}
		}
	}
</style>

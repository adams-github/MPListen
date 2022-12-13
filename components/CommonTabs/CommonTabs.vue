<template>
	<view class="tab-container">
		<view class="tab-box"></view>
		<scroll-view class="scroll-v" scroll-x scroll-with-animation>
			<view class="srcoll-content">
				<view class="tab-item-box">
					<block v-for="(item, index) in tabsData" :key="index">
						<view class="tab-item">{{ item.label }}</view>
					</block>
				</view>
			</view>
		</scroll-view>
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
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>
	.tab-container {
		
	}
</style>

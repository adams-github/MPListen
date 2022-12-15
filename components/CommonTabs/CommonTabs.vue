<template>
	<view class="tab-container">
		<view class="tab-box">
			<scroll-view class="scroll-v" scroll-x scroll-with-animation :scroll-left="screenLeft">
				<view class="srcoll-content">
					<view class="tab-item-box">
						<block v-for="(item, index) in tabsData" :key="index">
							<view :id="'_tabItem_' + index" class="tab-item"
								:class="{'tab-item-active' : activeIndex === index}" @click="onTabItemClick(index)"
								:style="{color: activeIndex === index ? defaultConfig.activeTextColor:defaultConfig.textColor}">
								{{ item.label }}
							</view>
						</block>
					</view>
					<view class="underLine" :style="{ 
						transform: 'translateX(' + slider.left + 'px)',
						width: defaultConfig.underLineWidth + 'px',
						height: defaultConfig.underLineHeight + 'px',
						backgroundColor: defaultConfig.underLineColor
						}"></view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "CommonTabs",
		emits: ['onTabItemClick'],
		props: {
			config: {
				type: Object,
				default: () => {
					return {};
				}
			},
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
				deviceWidth: 0,
				activeIndex: -1,
				defaultConfig: {
					textColor: "#8a8a8a",
					activeTextColor: "#22D59C",
					underLineWidth: 24,
					underLineHeight: 3,
					underLineColor: "#22D59C"
				},
				screenLeft: 0,
				slider: {
					left: 0
				},
				/* 用来记录tabItem的每个dom元素对象 */
				tabItemList: []
			};
		},
		watch: {
			config: {
				immediate: true,
				handler(val) {
					this.defaultConfig = {
						...this.defaultConfig,
						...val
					};
				}
			},
			defaultIndex: {
				handler(val) {
					this.activeIndex = val;
					this.slider.left = 0;
				},
				immediate: true
			},
			tabsData: {
				/**
				 * 先把tabItemList赋值为tabsData的对象数组，
				 * 可以让tabItemList的数组大小和tabsData的数组大小一致
				 * */
				handler(val) {
					this.tabItemList = val;
					// 设置0秒后执行，相当于等待DOM元素渲染完成了
					setTimeout(() => {
						this.updateTabItemWidth();
					}, 0);
				},
				immediate: true
			}
		},
		/**
		 * 组件生命周期方法
		 * 获取屏幕的宽度
		 * */
		created() {
			this.deviceWidth = uni.getWindowInfo().screenWidth;
		},
		methods: {
			/* 更新每个tabItem的宽度 */
			updateTabItemWidth() {
				let data = this.tabItemList;
				if (data.length === 0) return;
				//拿到渲染后的DOM元素
				const query = uni.createSelectorQuery().in(this);
				data.forEach((item, index) => {
					query
						.select('#_tabItem_' + index)
						.boundingClientRect((res) => {
							// res就是拿到的DOM对象
							// 给每个item设置一个_slider对象，记录指示条left的位置
							item._slider = {
								indicatorLeft: res.left + (res.width - this.defaultConfig.underLineWidth) /
									2
							};
							//全部DOM都渲染完成，拿到每个tabItem对应指示条的left位置之后，初始化
							if (data.length - 1 === index) {
								this.sliderIndicator();
							}
						})
						.exec();
				});
			},
			onTabItemClick(val) {
				this.activeIndex = val;
				this.sliderIndicator();
				this.$emit("onTabItemClick", val);
			},
			/**
			 * 点击tabItem之后，需要根据点击的item滑动指示条
			 * */
			sliderIndicator() {
				const index = this.activeIndex;
				this.slider = {
					left: this.tabItemList[this.activeIndex]._slider.indicatorLeft
				};
				this.screenLeft = this.slider.left + this.defaultConfig.underLineWidth / 2 - this.deviceWidth / 2;
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
							color: "#8a8a8a";

							&-active {
								color: "#22D59C";
								font-weight: bold;
							}
						}
					}

					.underLine {
						width: 24px;
						height: 3px;
						background-color: "#22D59C";
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

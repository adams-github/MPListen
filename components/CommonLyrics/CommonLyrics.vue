<template>
	<view class="lyric-main" :style="{
		width:cuAreaStyle.width,
		height:cuAreaStyle.height,
		background:cuAreaStyle.background}" @click="clickLyrics">
		<scroll-view id="lyric-show" class="lyric-show" scroll-with-animation="true" :scroll-y="true"
			:scroll-into-view="showLyricId" :style="{
		top:scrollView.top,
		width:cuAreaStyle.width,
		height:scrollView.height}">
			<view class="lrc-item" v-for="(v, i) in mLyrics.lrcs" :key="i">
				<text class="lrc" :id="'lrc-' + i" :style="{
					color:curLyricIndex == i ? cuLyricStyle.activeColor : cuLyricStyle.color,
					fontSize:curLyricIndex == i ? cuLyricStyle.activeFontSize : cuLyricStyle.fontSize,
					height:curLyricIndex == i ? cuLyricStyle.activeLineHeight : cuLyricStyle.lineHeight,
					backgroundColor:'inherit'
				}">{{v}}</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: "CommonLyrics",
		emits: ['onClickLyrics'],
		props: {
			lyrics: {
				default: () => [],
				type: Array
			},
			curTime: {
				default: 0,
				type: [Number, String]
			},
			lyricStyle: {
				default: () => {},
				type: Object
			},
			areaStyle: {
				default: () => {},
				type: Object
			}
		},
		computed: {
			lineHeightNum() {
				let size = this.sizeDeal(this.cuLyricStyle.fontSize)
				return size[0] * this.font2line4height
			},
			lineHeight() {
				let size = this.sizeDeal(this.cuLyricStyle.fontSize)
				return size[0] * 2 + size[1]
			},
			activeLineHeight() {
				let size = this.sizeDeal(this.cuLyricStyle.activeFontSize)
				return size[0] * 2 + size[1]
			},
			mLyrics() {
				return this.lrcDeal(this.lyrics)
			}
		},
		data() {
			return {
				font2line4height: 2.5,
				curLyricId: 'lrc-0', // 时间进度控制
				showLyricId: 'lrc-0', // 界面显示，时间和touch控制
				curLyricIndex: 0,
				spaceLineNum: 0,
				cuLyricStyle: {
					color: "#000000",
					activeColor: '#ffffff',
					fontSize: '16px',
					activeFontSize: '16px',
					lineHeight: '40px',
					activeLineHeight: '40px',
					selectedBGColor: 'inherit'
				},
				cuAreaStyle: {
					width: '100vw',
					height: '70vh',
					background: 'linear-gradient(#8cc8b4, #ffaa7f, #8cc8b4)',
				},
				scrollView: {
					height: '100%',
					top: 0
				},
				screen: {
					width: 0,
					height: 0,
					px2rpxscale: 1,
				},
			};
		},
		watch: {
			curTime(t) {
				let index = this.getIndex(t, this.mLyrics.times)
				this.curLyricIndex = index + this.spaceLineNum
				this.curLyricId = 'lrc-' + index
				this.showLyricId = this.curLyricId
			},
		},
		beforeMount() {
			const res = uni.getSystemInfoSync()
			this.screen.width = res.windowWidth
			this.screen.height = res.windowHeight
			this.screen.px2rpxscale = 750 / res.windowWidth;
			this.cuAreaStyle = Object.assign(this.cuAreaStyle, this.areaStyle)
			this.cuLyricStyle = Object.assign(this.cuLyricStyle, this.lyricStyle)
			if (this.lyricStyle) {
				if (!('activeFontSize' in this.lyricStyle)) {
					this.cuLyricStyle['activeFontSize'] = this.cuLyricStyle['fontSize']
				}
				if (!('lineHeight' in this.lyricStyle)) {
					let s = this.sizeDeal(this.cuLyricStyle['fontSize'])
					this.cuLyricStyle['lineHeight'] = s[0] * this.font2line4height + s[1] // 默认行高为字体大小的倍数
				}
				if (!('activeLineHeight' in this.lyricStyle)) {
					let s = this.sizeDeal(this.cuLyricStyle['activeFontSize'])
					this.cuLyricStyle['activeLineHeight'] = s[0] * this.font2line4height + s[1]
				}
			}
		},
		mounted() {
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this)
				query.select(".lyric-main").boundingClientRect(res => {
					this.cuAreaStyle.height = res.height + 'px'
					let size = this.sizeDeal(this.cuLyricStyle.lineHeight)
					let asize = this.sizeDeal(this.cuLyricStyle.activeLineHeight)
					let sumLine = Math.floor((res.height - asize[0]) / size[0]) // 不包含activeLine
					if (sumLine % 2 !== 0) {
						sumLine -= 1
					}
					this.spaceLineNum = Math.floor(sumLine / 2)
					this.scrollView.height = sumLine * size[0] + asize[0] + 'px'
					this.scrollView.top = (res.height - (sumLine * size[0] + asize[0])) / 2 + 'px'
				}).exec()
			})
		},
		methods: {
			getIndex(t, items) {
				t = Number(t)
				let index = 0
				for (var k_ in items) {
					let k = Number(items[k_])
					if (t == k) {
						return index
					} else if (t < k) {
						return index - 1
					} else if (index == items.length - 1) {
						return items.length - 1
					}
					index += 1
				}
			},
			sizeDeal(size) {
				// 分离字体大小和单位,rpx 转 px
				let s = Number.isNaN(parseFloat(size)) ? 0 : parseFloat(size)
				let u = size.toString().replace(/[0-9\.]/g, '')
				if (u == 'rpx') {
					s /= this.screen.px2rpxscale
					u = 'px'
				} else if (u == '') {
					u = 'px'
				} else if (u == 'vw') {
					u = 'px'
					s = s / 100 * 750 / this.screen.px2rpxscale
				}
				return [s, u, s + u]
			},
			lrcDeal(lrcl) {
				let lrcj = {
					lrcs: [],
					times: []
				}
				if (lrcl.length < 1) {
					lrcj.lrcs.push('还没有歌词...')
				} else {
					for (let i = 0; i < lrcl.length; i++) {
						let lrc = lrcl[i].toString()
						let tl = lrc.split(']')
						if (tl.length > 1) {
							// t: time; l: lyric
							let t_ = tl[0].replace('[', '')
							let t = t_.split(':')
							if (t.length > 1) {
								let treverse = t.reverse()
								let ts = 0
								if (treverse[0].indexOf('.') != -1) {
									// 毫秒以小数形式放在了秒上面
									for (let j = 0; j < treverse.length; j++) {
										ts += Number(treverse[j]) * 60 ** (j)
									}
								} else {
									// 毫秒单独放置
									for (let j = 0; j < treverse.length; j++) {
										if (j == 0) {
											ts += Number(treverse[j]) / 1000
										} else {
											ts += Number(treverse[j]) * 60 ** (j - 1)
										}
									}
								}
								ts = ts.toFixed(2)
								let l = tl.splice(1, 1000).join(']').trim()
								if (l.length > 0) {
									lrcj.times.push(ts)
									lrcj.lrcs.push(l)
								}
							} else {
								let l = tl.splice(1, 1000).join(']').trim()
								if (l.length > 0) {
									lrcj.times.push(Number(t_).toFixed(2))
									lrcj.lrcs.push(l)
								}
							}

						}
					}
				}
				for (let i = 0; i < this.spaceLineNum; i++) {
					lrcj.lrcs.push('')
					lrcj.lrcs.splice(0, 0, '')
				}
				return lrcj
			},
			clickLyrics(){
				this.$emit("onClickLyrics");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.lyric-main {
		position: relative;
	}

	.lyric-show {
		position: absolute;
		overflow-anchor: none;
	}

	.lyric-show ::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}

	.lyric-show text {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;
		text-align: center;
		white-space: nowrap;
		height: 32px;
		font-size: 16px;
		overflow: auto;
	}
</style>

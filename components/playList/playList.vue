<template>
	<view class="list-constainer">

		<view class="header">
			<image class="ic-mode" mode="aspectFit" :src="playModeSrc" @click="changePlayMode"></image>
			<text style="margin-left: 10px; color: #464646; font-size: 15px;"
				@click="changePlayMode">{{playModeStr}}</text>
			<text style="margin-left: 10px; color: #909399; font-size: 13px;">{{songCount}}</text>
		</view>

		<view class="divide-line"></view>

		<scroll-view scroll-y scroll-with-animation class="scrollview">
			<block v-for="(item, index) in songList" :key="index">
				<view style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;"
					hover-class="item-hover" @click="itemClick(index)">
					<view class="item-box">
						<text class="item-songname"
							:class="{'item-songname-playing' : playingIndex === index}">{{item.name}}</text>
						<text class="item-singer"
							:class="{'item-singer-playing' : playingIndex === index}">{{item.singer}}</text>
					</view>
					<view style="height: 30px; padding: 0 15px; display: flex; align-items: center;"
						@tap.native.stop="remove(index)">
						<uni-icons type="closeempty" size="20">
						</uni-icons>
					</view>
				</view>
			</block>
		</scroll-view>
	</view>
</template>

<script>
	import songStore from '../../utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'

	export default {
		name: "playList",
		emits: ['onDeleteItemClick'],
		props: {
			playing_song: {
				type: Object,
				default: () => {
					return {};
				}
			},
			delete_index: {
				type: Number,
				default: -1
			}
		},
		watch: {
			playing_song: {
				immediate: true,
				handler(val) {
					this.songList = songStore.getSongList();
					this.songCount = this.songList.length;
					this.playMode = songStore.getPlayMode();
					this.initModeView();
					this.playingSong = val;
					if (typeof this.songList != 'undefined' && this.songList != null && this.songList.length > 0) {
						this.playingIndex = this.songList.findIndex(this.findIndex);
					}
				}
			},
			delete_index: {
				immediate: true,
				handler(val) {
					if (val != -1) {
						this.songCount--;
						songStore.removeSong(val);
						if (val == this.playingIndex) {
							this.playingIndex = -1;
						}
					}
				}
			}
		},
		data() {
			return {
				playMode: 1,
				playModeSrc: '',
				playModeStr: '顺序播放',
				songList: [],
				songCount: 0,
				playingIndex: 0,
				playingSong: {},
			};
		},
		methods: {
			changePlayMode() {
				this.playMode++;
				this.playMode = this.playMode % 3;
				this.initModeView();
				songStore.changePlayMode(this.playMode);
			},
			initModeView() {
				switch (this.playMode) {
					case 0:
						this.playModeSrc = '../../static/ic_mode_single.png';
						this.playModeStr = '单曲循环';
						break;
					case 1:
						this.playModeSrc = '../../static/ic_mode_circle.png';
						this.playModeStr = '顺序播放';
						break;
					case 2:
						this.playModeSrc = '../../static/ic_mode_random.png';
						this.playModeStr = '随机播放';
						break;
				}
			},
			itemClick(index) {
				const clickSong = this.songList[index];
				bgPlayer.play(clickSong);
				songStore.clickSong(index);
			},
			remove(index) {
				this.$emit("onDeleteItemClick", index);
			},
			findIndex(item) {
				return item.id === this.playingSong.id && item.platform === this.playingSong.platform;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.list-constainer {
		display: flex;
		flex-direction: column;
		padding: 10px 0;

		.header {
			display: flex;
			flex-direction: row;
			align-items: center;
			margin-left: 15px;

			.ic-mode {
				width: 20px;
				height: 20px;
			}
		}

		.divide-line {
			height: 1px;
			background-color: #e4e4e4;
			margin: 10px 15px 0;
		}


		.scrollview {
			max-height: 350px;

			.item-box {
				width: 70%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: 10px 15px;

				.item-songname {
					color: #3a3a3a;
					font-size: 13px;
					max-width: 50%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;

					&-playing {
						color: #22D59C;
						font-size: 16px;
					}
				}

				.item-singer {
					color: #7d7d7d;
					font-size: 10px;
					max-width: 50%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;

					&-playing {
						color: #22D59C;
					}
				}
			}

			.item-hover {
				background-color: #F0F0F0;
			}
		}
	}
</style>

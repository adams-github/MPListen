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
		name: "PlayList",
		emits: ['onItemClick', 'onDeleteItemClick', 'onChangePlayMode'],
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
			},
			play_mode: {
				type: Number,
				default: 1
			}
		},
		watch: {
			playing_song: {
				immediate: true,
				handler(val) {
					if (this.playingSong != val || this.playingSong.id != val.id) {
						this.playingSong = val;
						if (this.songList.length > 0) {
							this.playingIndex = this.songList.findIndex(this.findIndex);
						}
					}
					if (typeof this.songList === 'undefined' || this.songList == null || this.songList.length == 0) {
						this.songList = songStore.getSongList();
						this.songCount = this.songList.length;
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
						} else if (val < this.playingIndex) {
							this.playingIndex--;
						}
					}
				}
			},
			songList: {
				immediate: true,
				handler(val) {
					//监听到歌曲列表变化后，要重新定位正在播放哪一首歌
					if (this.songCount != val.length) {
						this.songCount = val.length;
						if (this.playingIndex != -1 && val.length > 0) {
							this.playingIndex = val.findIndex(this.findIndex);
						}
					}
				}
			},
			play_mode: {
				immediate: true,
				handler(val) {
					if (this.playMode != val) {
						this.playMode = val;
						this.initModeView();
					}
				}
			}
		},
		created() {
			this.songList = songStore.getSongList();
			this.songCount = this.songList.length;
			this.playMode = songStore.getPlayMode();
			this.initModeView();
		},
		data() {
			return {
				playMode: -1,
				playModeSrc: '',
				playModeStr: '',
				hasInitMode: false,
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
				this.$emit('onChangePlayMode', this.playMode);
			},
			initModeView() {
				switch (this.playMode) {
					case 0:
						this.playModeSrc = '../../static/ic_mode_single.png';
						this.playModeStr = '单曲循环';
						break;
					case 1:
						this.playModeSrc = '../../static/ic_mode_circle.png';
						this.playModeStr = '循环播放';
						break;
					case 2:
						this.playModeSrc = '../../static/ic_mode_random.png';
						this.playModeStr = '随机播放';
						break;
				}
			},
			itemClick(index) {
				const clickSong = this.songList[index];
				if (this.playingSong.id != clickSong.id) {
					songStore.clickSong(index);
					this.$emit("onItemClick", index);
					bgPlayer.play(clickSong);
				}
			},
			remove(index) {
				if (this.songList[index] == null || (typeof this.songList[index]) === 'undefined') {
					this.songCount--;
					songStore.removeSong(index);
					if (index == this.playingIndex) {
						this.playingIndex = -1;
					}
				} else {
					this.$emit("onDeleteItemClick", index);
				}
			},
			findIndex(item) {
				return item.id === this.playingSong.id;
			},
			getPlatform(item) {
				switch (item.platform) {
					case 'netease':
						return '网易';
					case 'kuwo':
						return '酷我';
					case 'qq':
						return 'QQ';
					case 'kugou':
						return '酷狗';
					case 'migu':
						return '咪咕';
				}
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

				.platform-tag {
					color: #7d7d7d;
					font-size: 8px;
					border-bottom-width: 1rpx;
					border-bottom-style: solid;
					border-bottom-color: #F0F0F0;
				}

				.item-songname {
					color: #3a3a3a;
					font-size: 13px;
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

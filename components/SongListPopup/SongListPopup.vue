<template>
	<view >
		<uni-popup ref="popup" background-color="#fff" @change="change">
			<view class="list-constainer">
				<view class="header">
					<view class="mode-container" hover-class="click-hover"  @click="changePlayMode">
						<image class="ic-mode" mode="aspectFit" :src="playModeSrc"></image>
						<text style="margin-left: 5px; color: #464646; font-size: 15px;"
							@click="changePlayMode">{{playModeStr}}</text>
					</view>
					<text style="margin-left: 10px; color: #909399; font-size: 13px;">{{songCount}}</text>
					<view class="clearAll-container" hover-class="click-hover" @click="clearAll">
						<uni-icons type="trash" size="20">
						</uni-icons>
						<text style="margin-left: 5px; color: #464646; font-size: 15px;">清空</text>
					</view>
				</view>
				<view class="divide-line"></view>
				<scroll-view scroll-y scroll-with-animation class="scrollview">
					<block v-for="(item, index) in songList" :key="index">
						<view
							style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;"
							@click="itemClick(index)">
							<view class="item-box" hover-class="item-hover">
								<text class="item-songname"
									:class="{'item-songname-playing' : playingIndex === index}">{{item.name}}</text>
								<text class="item-singer"
									:class="{'item-singer-playing' : playingIndex === index}">{{item.singer}}</text>
							</view>
							<view class="delete-container" hover-class="item-hover" @tap.native.stop="remove(index)">
								<uni-icons type="trash" size="20">
								</uni-icons>
							</view>
						</view>
					</block>
				</scroll-view>
			</view>
		</uni-popup>
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog type="info" cancelText="取消" confirmText="确定" title="删除歌曲" :content="deleteInfo"
				@confirm="onDeleteConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import songStore from '../../utils/songStore.js'
	import bgPlayer from '@/utils/bgPlayer.js'

	var deleteIndex = -2;

	export default {
		name: "SongListPopup",
		emits: ['onShowChange', 'onChangePlayMode'],
		mounted() {
			this.songList = songStore.getSongList();
			this.songCount = this.songList.length;
			this.playMode = songStore.getPlayMode();
			this.initModeView();
		},
		props: {
			playing_song: {
				type: Object,
				default: () => {
					return {};
				}
			},
			play_mode: {
				type: Number,
				default: 1
			}
		},
		watch: {
			play_mode: {
				immediate: true,
				handler(val) {
					if (val >= 0 && val <= 2 && this.playMode != val) {
						this.playMode = val;
						this.initModeView();
					}
				}
			},
			playing_song: {
				immediate: true,
				handler(val) {
					if (val != null && (this.playingSong != val || this.playingSong.id != val.id)) {
						this.playingSong = val;
						if (this.songList.length > 0) {
							this.playingIndex = this.songList.findIndex(this.findIndex);
						}
					}
					if (this.songList.length == 0) {
						this.songList = songStore.getSongList();
						this.songCount = this.songList.length;
						this.playingIndex = this.songList.findIndex(this.findIndex);
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
		},
		data() {
			return {
				playMode: 1,
				playModeSrc: '',
				playModeStr: '',
				songCount: 0,
				playingIndex: 0,
				playingSong: {},
				songList: [],
				deleteInfo: '',
			};
		},
		methods: {
			open() {
				this.$refs.popup.open('bottom');
			},
			change(e) {
				this.$emit('onShowChange', e);
			},
			changePlayMode() {
				this.playMode++;
				this.playMode = this.playMode % 3;
				this.initModeView();
				songStore.changePlayMode(this.playMode);
				this.$emit('onChangePlayMode', this.playMode);
			},
			findIndex(item) {
				return item.id === this.playingSong.id;
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
					bgPlayer.playSong(clickSong);
				}
			},
			clearAll() {
				deleteIndex = -1;
				this.deleteInfo = '确定要删除所有音乐?';
				this.$refs.alertDialog.open()
			},
			remove(index) {
				deleteIndex = index;
				const deleteSong = songStore.getSongByIndex(index);
				this.deleteInfo = '确定要删除\"' + deleteSong.singer + '-' + deleteSong.name + '\"?';
				this.$refs.alertDialog.open()
			},
			onDeleteConfirm() {
				if (deleteIndex == -1){
					songStore.removeAllSong();
				} else if (deleteIndex >= 0) {
					this.songCount--;
					songStore.removeSong(deleteIndex);
					if (deleteIndex == this.playingIndex) {
						this.playingIndex = -1;
					} else if (deleteIndex < this.playingIndex) {
						this.playingIndex--;
					}
				}
				deleteIndex = -2;
			},
		}
	}
</script>

<style lang="scss">
	.list-constainer {
		display: flex;
		flex-direction: column;
		padding: 10px 0;

		.header {
			display: flex;
			flex-direction: row;
			align-items: center;
			margin-left: 10px;
			
			.mode-container{
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				padding: 5px;
				border-radius: 5px;
			}

			.ic-mode {
				width: 20px;
				height: 20px;
			}

			.clearAll-container {
				position: absolute;
				right: 10px;
				padding: 5px;
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				border-radius: 5px;
			}

			.click-hover {
				background-color: #F0F0F0;
			}
		}

		.divide-line {
			height: 1px;
			background-color: #e4e4e4;
			margin: 10px 15px 0;
		}


		.scrollview {
			max-height: 60vh;

			.item-box {
				width: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: 10px 15px;

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

			.delete-container {
				width: 40px;
				height: 40px;
				position: absolute;
				right: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 20px;
			}

			.item-hover {
				background-color: #F0F0F0;
			}
		}
	}
</style>

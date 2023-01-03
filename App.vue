<script>
	import songStore from '@/utils/songStore.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			songStore.loadAllSongs();
			songStore.loadPlayingIndex();
			songStore.loadRandomIndex();
			songStore.loadPlayMode();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';

	// 设置整个项目的背景色
	page {
		background-color: #FAFAFA;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}

	/* 隐藏scroll-view的滚动条 */
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}
</style>

let downloadJs = {};

/**
 * 下载歌曲到本地
 * 
 * 以下为微信文件系统介绍
 * 
 * 文件主要分为两大类：
 * 代码包文件：代码包文件指的是在项目目录中添加的文件。
 * 本地文件：通过调用接口本地产生，或通过网络下载下来，存储到本地的文件。
 * 
 * 其中本地文件又分为三种：
 * 本地临时文件：临时产生，随时会被回收的文件。运行时最多存储 4GB，结束运行后，如果已使用超过 2GB，会以文件为维度按照最近使用时间从远到近进行清理至少于2GB。
 * 本地缓存文件：小程序通过接口把本地临时文件缓存后产生的文件，不能自定义目录和文件名。跟本地用户文件共计，小程序（含小游戏）最多可存储 200MB。
 * 本地用户文件：小程序通过接口把本地临时文件缓存后产生的文件，允许自定义目录和文件名。跟本地缓存文件共计，小程序（含小游戏）最多可存储 200MB。
 */
downloadJs.dowloadSong = function(songId, url, successCb, errorCb) {
	let downloadUrl = url;
	downloadUrl = downloadUrl.replace('http:', 'https:');
	uni.downloadFile({
		url: downloadUrl,
		success: (res) => {
			if (typeof successCb === 'function') {
				successCb({
					id: songId,
					path: data.tempFilePath
				});
			}
		},
		fail: (error) => {
			console.error("downloadFailed：" + error.errMsg + "; url: " + url);
			if (typeof errorCb === 'function') {
				errorCb(error);
			}
		}
	});
}

export default downloadJs;

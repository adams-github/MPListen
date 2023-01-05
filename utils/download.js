let downloadJs = {};

/**
 * 下载歌曲到本地
 */
downloadJs.cacheSong = function(songId, url, platform, successCb, errorCb) {
	let downloadUrl = url;
	if (platform != 'kuwo') {
		downloadUrl = downloadUrl.replace('http:', 'https:');
	}
	uni.downloadFile({
		url: downloadUrl,
		success: (res) => {
			//保存临时文件到本地，这样下次小程序启动也能继续使用文件
			uni.getFileSystemManager().saveFile({
				tempFilePath: res.tempFilePath,
				success: function(data) {
					console.info('saveFile: success');
					if (typeof successCb === 'function') {
						successCb({
							id: songId,
							path: data.savedFilePath
						});
					}
				},
				fail: function(errMsg) {
					console.error("saveFailed：" + errMsg);
					if (typeof errorCb === 'function') {
						errorCb(error);
					}
				}
			});

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

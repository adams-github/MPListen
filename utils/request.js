function request({
	request_url,
	request_data,
	request_method,
	request_header,
}) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: request_url,
			data: request_data,
			method: request_method,
			header: request_header,
			success: ({
				data,
				statusCode,
				header
			}) => {
				if (statusCode === 200) {
					resolve(data);
				} else {
					reject(data);
				}
			},
			fail: ({
				errMsg
			}) => {
				console.log(errMsg);
				reject(errMsg);
			}
		})
	});
}

export default request;

let Request = {};

Request.request = function({
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
				header,
				cookies
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
				console.error(errMsg);
				reject(errMsg);
			}
		})
	});
}

Request.requestGetHeader = function({
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
				header,
				cookies
			}) => {
				if (statusCode === 200) {
					resolve({
						data,
						statusCode,
						header,
						cookies
					});
				} else {
					reject(data);
				}
			},
			fail: ({
				errMsg
			}) => {
				console.error(errMsg);
				reject(errMsg);
			}
		})
	});
}

export default Request;

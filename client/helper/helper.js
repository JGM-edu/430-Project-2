const handleError = (err) => {
	console.log('error');
	console.error(err);
	$("#logger").text(err);
};

const redirect = (response) => {
	window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
	$.ajax({
		cache:		false,
		type:		type,
		url:		action,
		data:		data,
		dataType:	"json",
		success:	success,
		error:		function(xhr, status, error) {
			try {
				var messageObj = JSON.parse(xhr.responseText);
				handleError(messageObj);
			} catch(e) {
				handleError("Unparsable Error Response");
			}
		}
	});
}
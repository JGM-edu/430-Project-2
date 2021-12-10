const handleError = (err) => {
	console.log('error');
	console.error(err);
	$("#logger").text(messageObj.error);
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
			var messageObj = JSON.parse(xhr.responseText);
			$("#logger").text(messageObj.error);
		}
	});
}
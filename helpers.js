exports.errorResonse = function (req, res, statusCode, message, error) {
    if (req.get('env') === 'development') {
        res.status(statusCode || 500);
        res.json({
            'errors': [{
                message,
                error: error || {}
            }]
        });
    } else {
        res.status(statusCode || 500);
        res.json({
            'errors': [{
                message,
                error: {}
            }]
        });
    }
}
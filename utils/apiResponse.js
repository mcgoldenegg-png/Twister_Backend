class ApiResponse {
  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      code: statusCode,
      success: true,
      message,
      data
    });
  }

  static created(res, message, data) {
    return this.success(res, message, data, 201);
  }

  static notFound(res, message) {
    return this.error(res, message, 404);
  }

  static error(res, message, statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      code: statusCode,
      success: false,
      message,
      errors
    });
  }
}

module.exports = ApiResponse;
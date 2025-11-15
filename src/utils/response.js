// utils/response.js

export const success = (res, message, data = null, status = 200) => {
    return res.status(status).json({
        status: "success",
        message,
        data
    });
};

export const error = (res, message, status = 400, details = null) => {
    return res.status(status).json({
        status: "error",
        message,
        details
    });
};

package com.alicorp.truedom.shared;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private String error;

    public ApiResponse(T data) {
        this.success = true;
        this.data = data;
    }

    public ApiResponse(T data, String message) {
        this.success = true;
        this.data = data;
        this.message = message;
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(data, message);
    }

    public static <T> ApiResponse<T> error(String error) {
        var r = new ApiResponse<T>((T) null);
        r.success = false;
        r.error = error;
        return r;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}

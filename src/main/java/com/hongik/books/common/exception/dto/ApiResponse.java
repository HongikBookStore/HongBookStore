package com.hongik.books.common.exception.dto;

public record ApiResponse<T>(boolean success, String message, T data) {
}

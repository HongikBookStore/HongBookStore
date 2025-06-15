package com.hongik.books.user.dto;

public record ApiResponse<T>(boolean success, String message, T data) {
}

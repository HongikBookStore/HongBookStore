package com.hongik.books.exception;

import org.springframework.security.core.AuthenticationException;

public class UserNotEnabledException extends AuthenticationException {
    public UserNotEnabledException(String msg) {
        super(msg);
    }
}

package com.hongik.books.common.exception;

import org.springframework.security.core.AuthenticationException;

public class UserAccountLockedException extends AuthenticationException {
    public UserAccountLockedException(String msg) {
        super(msg);
    }
}

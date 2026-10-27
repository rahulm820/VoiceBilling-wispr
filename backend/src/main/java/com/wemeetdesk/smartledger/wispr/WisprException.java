package com.wemeetdesk.smartledger.wispr;

public class WisprException extends RuntimeException {
    public WisprException(String message) {
        super(message);
    }

    public WisprException(String message, Throwable cause) {
        super(message, cause);
    }
}

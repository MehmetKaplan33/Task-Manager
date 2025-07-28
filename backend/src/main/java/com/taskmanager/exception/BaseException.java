package com.taskmanager.exception;

public class BaseException extends RuntimeException {
    private final MessageType messageType;

    public BaseException(MessageType messageType) {
        super(messageType.getMessage());
        this.messageType = messageType;
    }

    public BaseException(MessageType messageType, String additionalInfo) {
        super(additionalInfo != null ? messageType.getMessage() + ": " + additionalInfo : messageType.getMessage());
        this.messageType = messageType;
    }

    public MessageType getMessageType() {
        return messageType;
    }
}

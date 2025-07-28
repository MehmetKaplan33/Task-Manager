package com.taskmanager.exception;

import lombok.Getter;

@Getter
public enum MessageType {
    NO_RECORD_EXIST("1001", "Kayıt bulunamadı"),
    GENERAL_EXCEPTION("9999", "Beklenmeyen bir hata oluştu"),
    INVALID_CREDENTIALS("1002", "Geçersiz kullanıcı adı veya şifre"),
    ALREADY_EXIST("1003", "Bu kayıt zaten mevcut"),
    VALIDATION_ERROR("1004", "Doğrulama hatası"),
    WRONG_PASSWORD("1005", "Hatalı şifre"),
    EMAIL_IN_USE("1006", "Bu email adresi zaten kullanımda"),
    INVALID_INPUT("1007", "Geçersiz giriş verileri"),
    DATABASE_ERROR("1008", "Veritabanı işlemi sırasında hata oluştu"),
    UNAUTHORIZED("1009", "Bu işlem için yetkiniz yok"),
    REQUIRED_FIELD("1010", "Zorunlu alan eksik"),
    INVALID_DATE("1011", "Geçersiz tarih formatı"),
    INVALID_STATUS("1012", "Geçersiz durum değeri");

    private final String code;
    private final String message;

    MessageType(String code, String message) {
        this.code = code;
        this.message = message;
    }
}

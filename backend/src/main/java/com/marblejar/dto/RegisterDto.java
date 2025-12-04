package com.marblejar.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterDto {
    @Email
    @NotBlank
    private String email;

    @NotBlank

    private String password;

    @NotBlank
    private String name;

    public RegisterDto() {}

    public RegisterDto(String email, String password, String name) {
        this.email = email;
        this.password = password;
        this.name = name;
    }

    // getters / setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

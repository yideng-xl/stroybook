package com.storybook.controller;

import com.storybook.dto.JwtResponse;
import com.storybook.dto.LoginRequest;
import com.storybook.dto.SignupRequest;
import com.storybook.entity.User;
import com.storybook.repository.UserRepository;
import com.storybook.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(loginRequest.getUsername());

        org.springframework.security.core.userdetails.User userDetails = (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (!isValidPassword(signUpRequest.getPassword())) {
             return ResponseEntity.badRequest().body("Error: Password must be at least 8 chars and include 2 of: uppercase, lowercase, digit, special char.");
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody com.storybook.dto.ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Error: Invalid old password.");
        }

        if (!isValidPassword(request.getNewPassword())) {
            return ResponseEntity.badRequest().body("Error: Password too weak.");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok("Password changed successfully!");
    }

    private boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) return false;
        int categories = 0;
        if (password.matches(".*[A-Z].*")) categories++;
        if (password.matches(".*[a-z].*")) categories++;
        if (password.matches(".*\\d.*")) categories++;
        if (password.matches(".*[^a-zA-Z0-9].*")) categories++;
        return categories >= 2;
    }
}

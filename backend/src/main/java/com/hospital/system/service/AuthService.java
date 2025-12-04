package com.hospital.system.service;

import com.hospital.system.dto.AuthRequest;
import com.hospital.system.dto.AuthResponse;
import com.hospital.system.dto.RegisterRequest;
import com.hospital.system.model.Doctor;
import com.hospital.system.model.Role;
import com.hospital.system.model.User;
import com.hospital.system.repository.DoctorRepository;
import com.hospital.system.repository.UserRepository;
import com.hospital.system.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .build();
        
        userRepository.save(user);
        
        // Si el rol es DOCTOR, crear registro en tabla doctors
        if (request.getRole() == Role.DOCTOR) {
            var doctor = Doctor.builder()
                    .user(user)
                    .specialization("General")
                    .licenseNumber("LIC-" + user.getId())
                    .build();
            doctorRepository.save(doctor);
        }
        
        var jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }
}

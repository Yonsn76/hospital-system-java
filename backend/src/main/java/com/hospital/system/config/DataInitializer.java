package com.hospital.system.config;

import com.hospital.system.model.core.Doctor;
import com.hospital.system.model.auth.Role;
import com.hospital.system.model.auth.User;
import com.hospital.system.repository.core.DoctorRepository;
import com.hospital.system.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // ADMIN: Carlos - Acceso total
        if (!userRepository.existsByUsername("carlos")) {
            User admin = User.builder()
                    .username("carlos")
                    .password(passwordEncoder.encode("carlos"))
                    .email("carlos.ramirez@hospital.com")
                    .firstName("Carlos")
                    .lastName("Ramírez")
                    .phoneNumber("0991234567")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin creado: username=carlos, password=carlos");
        }

        // DOCTOR: Laura - Gestiona citas y registros médicos
        if (!userRepository.existsByUsername("laura")) {
            User doctorUser = User.builder()
                    .username("laura")
                    .password(passwordEncoder.encode("laura"))
                    .email("laura.mendoza@hospital.com")
                    .firstName("Laura")
                    .lastName("Mendoza")
                    .phoneNumber("0982345678")
                    .role(Role.DOCTOR)
                    .build();
            userRepository.save(doctorUser);

            Doctor doctor = Doctor.builder()
                    .user(doctorUser)
                    .specialization("Medicina General")
                    .licenseNumber("MED-001")
                    .build();
            doctorRepository.save(doctor);
            System.out.println("Doctor creado: username=laura, password=laura");
        }

        // NURSE: Ana - Solo lectura
        if (!userRepository.existsByUsername("ana")) {
            User nurse = User.builder()
                    .username("ana")
                    .password(passwordEncoder.encode("ana"))
                    .email("ana.rojas@hospital.com")
                    .firstName("Ana")
                    .lastName("Rojas")
                    .phoneNumber("0973456789")
                    .role(Role.NURSE)
                    .build();
            userRepository.save(nurse);
            System.out.println("Enfermera creada: username=ana, password=ana");
        }

        // RECEPTIONIST: María - Gestiona pacientes y citas
        if (!userRepository.existsByUsername("maria")) {
            User receptionist = User.builder()
                    .username("maria")
                    .password(passwordEncoder.encode("maria"))
                    .email("maria.lopez@hospital.com")
                    .firstName("María")
                    .lastName("López")
                    .phoneNumber("0964567890")
                    .role(Role.RECEPTIONIST)
                    .build();
            userRepository.save(receptionist);
            System.out.println("Recepcionista creada: username=maria, password=maria");
        }
    }
}

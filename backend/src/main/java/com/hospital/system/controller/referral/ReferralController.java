package com.hospital.system.controller.referral;

import com.hospital.system.dto.referral.ReferralRequest;
import com.hospital.system.dto.referral.ReferralResponse;
import com.hospital.system.dto.referral.ReferralStatusUpdateRequest;
import com.hospital.system.service.referral.ReferralService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for referral operations.
 * Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */
@RestController
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    /**
     * Create a referral for a patient.
     * Requirements 9.1: Create referral with destination, reason, and urgency
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ReferralResponse> createReferral(
            @Valid @RequestBody ReferralRequest request,
            Authentication authentication) {
        ReferralResponse response = referralService.createReferral(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get referral by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<ReferralResponse> getReferralById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.getReferralById(id));
    }

    /**
     * Accept a referral.
     * Requirements 9.3: Update referral status
     */
    @PutMapping("/{id}/accept")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<ReferralResponse> acceptReferral(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.acceptReferral(id));
    }

    /**
     * Complete a referral with optional appointment link.
     * Requirements 9.3: Update referral status and link resulting consultation
     */
    @PutMapping("/{id}/complete")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<ReferralResponse> completeReferral(
            @PathVariable Long id,
            @RequestParam(required = false) Long appointmentId,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.completeReferral(id, appointmentId));
    }

    /**
     * Cancel a referral.
     * Requirements 9.3: Update referral status
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<ReferralResponse> cancelReferral(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.cancelReferral(id));
    }

    /**
     * Update referral status.
     * Requirements 9.3: Update referral status and link resulting consultation
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<ReferralResponse> updateReferralStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReferralStatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.updateReferralStatus(id, request));
    }

    /**
     * Get all referrals for a patient.
     * Requirements 9.4: View patient's referral history with current status
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<List<ReferralResponse>> getReferralsByPatient(
            @PathVariable Long patientId,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.getReferralsByPatient(patientId));
    }

    /**
     * Get pending referrals for a destination doctor.
     * Requirements 9.5: Display pending referrals in doctor's list
     */
    @GetMapping("/doctor/{doctorId}/pending")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<List<ReferralResponse>> getPendingReferralsForDoctor(
            @PathVariable Long doctorId,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.getPendingReferralsForDoctor(doctorId));
    }

    /**
     * Get all referrals created by a referring doctor.
     */
    @GetMapping("/doctor/{doctorId}/created")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'referencias')")
    public ResponseEntity<List<ReferralResponse>> getReferralsByReferringDoctor(
            @PathVariable Long doctorId,
            Authentication authentication) {
        return ResponseEntity.ok(referralService.getReferralsByReferringDoctor(doctorId));
    }
}

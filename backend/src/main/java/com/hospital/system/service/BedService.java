package com.hospital.system.service;

import com.hospital.system.dto.BedRequest;
import com.hospital.system.dto.BedResponse;
import com.hospital.system.model.Bed;
import com.hospital.system.model.BedStatus;
import com.hospital.system.repository.BedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for bed management operations.
 * Requirements 7.2, 7.5: Manage bed assignments and track availability
 */
@Service
@RequiredArgsConstructor
public class BedService {

    private final BedRepository bedRepository;

    @Transactional
    public BedResponse createBed(BedRequest request) {
        if (bedRepository.findByBedNumber(request.getBedNumber()).isPresent()) {
            throw new RuntimeException("Bed with number " + request.getBedNumber() + " already exists");
        }

        Bed bed = Bed.builder()
                .bedNumber(request.getBedNumber())
                .area(request.getArea())
                .status(request.getStatus() != null ? request.getStatus() : BedStatus.AVAILABLE)
                .build();

        Bed savedBed = bedRepository.save(bed);
        return mapToResponse(savedBed);
    }

    @Transactional(readOnly = true)
    public BedResponse getBedById(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
        return mapToResponse(bed);
    }

    @Transactional(readOnly = true)
    public List<BedResponse> getAllBeds() {
        return bedRepository.findAllByOrderByAreaAscBedNumberAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all available beds.
     * Requirements 7.5: Display real-time status of all beds by area
     */
    @Transactional(readOnly = true)
    public List<BedResponse> getAvailableBeds() {
        return bedRepository.findByStatusOrderByAreaAscBedNumberAsc(BedStatus.AVAILABLE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BedResponse> getBedsByArea(String area) {
        return bedRepository.findByArea(area)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BedResponse> getBedsByStatus(BedStatus status) {
        return bedRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BedResponse updateBedStatus(Long id, BedStatus status) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
        
        bed.setStatus(status);
        Bed updatedBed = bedRepository.save(bed);
        return mapToResponse(updatedBed);
    }

    @Transactional
    public BedResponse updateBed(Long id, BedRequest request) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));

        if (!bed.getBedNumber().equals(request.getBedNumber())) {
            if (bedRepository.findByBedNumber(request.getBedNumber()).isPresent()) {
                throw new RuntimeException("Bed with number " + request.getBedNumber() + " already exists");
            }
            bed.setBedNumber(request.getBedNumber());
        }

        bed.setArea(request.getArea());
        if (request.getStatus() != null) {
            bed.setStatus(request.getStatus());
        }

        Bed updatedBed = bedRepository.save(bed);
        return mapToResponse(updatedBed);
    }

    @Transactional
    public void deleteBed(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
        
        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new RuntimeException("Cannot delete an occupied bed");
        }
        
        bedRepository.delete(bed);
    }

    /**
     * Internal method to get bed entity by ID.
     */
    @Transactional(readOnly = true)
    public Bed getBedEntity(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
    }

    /**
     * Internal method to save bed entity.
     */
    @Transactional
    public Bed saveBed(Bed bed) {
        return bedRepository.save(bed);
    }

    public BedResponse mapToResponse(Bed bed) {
        return BedResponse.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .area(bed.getArea())
                .status(bed.getStatus())
                .currentHospitalizationId(bed.getCurrentHospitalizationId())
                .build();
    }
}

package com.hospital.system.repository.hospitalization;

import com.hospital.system.model.hospitalization.BedTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for BedTransfer entity operations.
 * Requirements 7.3: Track patient transfers between beds
 */
@Repository
public interface BedTransferRepository extends JpaRepository<BedTransfer, Long> {

    List<BedTransfer> findByHospitalizationIdOrderByTransferredAtDesc(Long hospitalizationId);

    List<BedTransfer> findByFromBedId(Long fromBedId);

    List<BedTransfer> findByToBedId(Long toBedId);
}

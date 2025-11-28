package com.hospital.system.dto;

import com.hospital.system.model.ResourceStatus;
import com.hospital.system.model.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResourceRequest {
    private String name;
    private ResourceType type;
    private ResourceStatus status;
    private String location;
}

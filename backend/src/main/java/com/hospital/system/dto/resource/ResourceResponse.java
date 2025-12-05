package com.hospital.system.dto.resource;

import com.hospital.system.model.resource.ResourceStatus;
import com.hospital.system.model.resource.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResourceResponse {
    private Long id;
    private String name;
    private ResourceType type;
    private ResourceStatus status;
    private String location;
}

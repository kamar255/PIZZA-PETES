
package com.pizzapetes.service;

import com.pizzapetes.entity.Size;
import com.pizzapetes.repository.SizeRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SizeService {

    private final SizeRepository sizeRepository;

    public SizeService(SizeRepository sizeRepository) {
        this.sizeRepository = sizeRepository;
    }

    public List<Size> getAllSizes() {
        return sizeRepository.findAll();
    }

    public List<Size> getAvailableSizes() {
        return sizeRepository.findByAvailableTrue();
    }

    public Size getSizeById(Long id) {
        return sizeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Taille introuvable : " + id));
    }

    public Size createSize(Size size) {
        return sizeRepository.save(size);
    }

    public Size updateSize(Long id, Size sizeDetails) {
        Size size = getSizeById(id);

        size.setName(sizeDetails.getName());
        size.setDescription(sizeDetails.getDescription());
        size.setExtraPrice(sizeDetails.getExtraPrice());
        size.setAvailable(sizeDetails.isAvailable());

        return sizeRepository.save(size);
    }

    public void deleteSize(Long id) {
        Size size = getSizeById(id);
        sizeRepository.delete(size);
    }
}

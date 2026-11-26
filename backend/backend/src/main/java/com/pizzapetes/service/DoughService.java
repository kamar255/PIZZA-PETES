
package com.pizzapetes.service;

import com.pizzapetes.entity.Dough;
import com.pizzapetes.repository.DoughRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoughService {

    private final DoughRepository doughRepository;

    public DoughService(DoughRepository doughRepository) {
        this.doughRepository = doughRepository;
    }

    public List<Dough> getAllDoughs() {
        return doughRepository.findAll();
    }

    public List<Dough> getAvailableDoughs() {
        return doughRepository.findByAvailableTrue();
    }

    public Dough getDoughById(Long id) {
        return doughRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pâte introuvable : " + id));
    }

    public Dough createDough(Dough dough) {
        return doughRepository.save(dough);
    }

    public Dough updateDough(Long id, Dough doughDetails) {
        Dough dough = getDoughById(id);

        dough.setName(doughDetails.getName());
        dough.setDescription(doughDetails.getDescription());
        dough.setExtraPrice(doughDetails.getExtraPrice());
        dough.setAvailable(doughDetails.isAvailable());

        return doughRepository.save(dough);
    }

    public void deleteDough(Long id) {
        Dough dough = getDoughById(id);
        doughRepository.delete(dough);
    }
}

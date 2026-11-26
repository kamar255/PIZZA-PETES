
package com.pizzapetes.config;

import com.pizzapetes.entity.Role;
import com.pizzapetes.enums.RoleName;
import com.pizzapetes.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            if (!roleRepository.existsByName(RoleName.CLIENT)) {
                Role clientRole = new Role();
                clientRole.setName(RoleName.CLIENT);
                roleRepository.save(clientRole);
            }

            if (!roleRepository.existsByName(RoleName.ADMIN)) {
                Role adminRole = new Role();
                adminRole.setName(RoleName.ADMIN);
                roleRepository.save(adminRole);
            }

            System.out.println("Les rôles CLIENT et ADMIN sont initialisés !");
        };
    }
}

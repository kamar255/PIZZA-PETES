
package com.pizzapetes.service;

import com.pizzapetes.dto.UserDTO;
import com.pizzapetes.entity.User;
import com.pizzapetes.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable : " + id));

        return convertToDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable : " + email));

        return convertToDTO(user);
    }

    // Modification d'un utilisateur par l'administrateur
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable : " + id));

        validateEmail(userDTO.getEmail(), user);

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());

        User updatedUser = userRepository.save(user);

        return convertToDTO(updatedUser);
    }

    // Modification du profil de l'utilisateur connecté
    @Transactional
    public UserDTO updateUserByEmail(String authenticatedEmail, UserDTO userDTO) {

        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable : " + authenticatedEmail));

        validateEmail(userDTO.getEmail(), user);

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());

        User updatedUser = userRepository.save(user);

        return convertToDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable : " + id));

        userRepository.delete(user);
    }

    // Vérifier que l'adresse email n'est pas déjà utilisée
    private void validateEmail(String email, User currentUser) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("L'adresse email est obligatoire.");
        }

        userRepository.findByEmail(email)
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(currentUser.getId())) {
                        throw new RuntimeException(
                                "Cette adresse email est déjà utilisée."
                        );
                    }
                });
    }

    // Conversion User vers UserDTO
    private UserDTO convertToDTO(User user) {

        String roleName = user.getRole() != null
                ? user.getRole().getName().name()
                : "CLIENT";

        return new UserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                roleName
        );
    }
}

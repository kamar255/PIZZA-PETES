
package com.pizzapetes.controller;

import com.pizzapetes.dto.UserDTO;
import com.pizzapetes.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Récupérer le profil de l'utilisateur connecté
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Principal principal) {

        UserDTO user = userService.getUserByEmail(principal.getName());

        return ResponseEntity.ok(user);
    }

    // Modifier le profil de l'utilisateur connecté
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            Principal principal,
            @RequestBody UserDTO userDTO) {

        UserDTO updatedUser = userService.updateUserByEmail(
                principal.getName(),
                userDTO
        );

        return ResponseEntity.ok(updatedUser);
    }

    // Récupérer tous les utilisateurs (administrateur)
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {

        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Récupérer un utilisateur par son ID (administrateur)
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Modifier un utilisateur par son ID (administrateur)
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO userDTO) {

        return ResponseEntity.ok(
                userService.updateUser(id, userDTO)
        );
    }

    // Supprimer un utilisateur (administrateur)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}

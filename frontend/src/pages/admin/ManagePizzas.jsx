
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Pizza } from "lucide-react";

import pizzaService from "../../services/pizzaService";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "",
  available: true,
};

const API_IMAGE_BASE_URL = "http://localhost:5173";

function ManagePizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchPizzas = useCallback(async () => {
    try {
      setError("");
      const response = await pizzaService.getAllPizzas();

      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setPizzas(data);
    } catch (err) {
      console.error("Erreur chargement pizzas :", err);
      setError("Impossible de charger les pizzas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializePizzas = async () => {
      try {
        setError("");
        const response = await pizzaService.getAllPizzas();

        const data = Array.isArray(response)
          ? response
          : response?.data || [];

        if (isMounted) {
          setPizzas(data);
        }
      } catch (err) {
        console.error("Erreur chargement pizzas :", err);

        if (isMounted) {
          setError("Impossible de charger les pizzas.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializePizzas();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingPizza(null);
    setFormData(INITIAL_FORM);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (pizza) => {
    setEditingPizza(pizza);

    setFormData({
      name: pizza.name || "",
      description: pizza.description || "",
      price: pizza.price ?? "",
      imageUrl: pizza.imageUrl || "",
      category: pizza.category || "",
      available: pizza.available ?? true,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPizza(null);
    setFormData(INITIAL_FORM);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Le nom de la pizza est obligatoire.");
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    const pizzaData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      imageUrl: formData.imageUrl.trim(),
      category: formData.category.trim(),
      available: formData.available,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingPizza) {
        await pizzaService.updatePizza(editingPizza.id, pizzaData);
        setSuccess("Pizza modifiée avec succès.");
      } else {
        await pizzaService.createPizza(pizzaData);
        setSuccess("Pizza ajoutée avec succès.");
      }

      closeModal();
      await fetchPizzas();
    } catch (err) {
      console.error("Erreur sauvegarde pizza :", err);
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pizza) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la pizza "${pizza.name}" ?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await pizzaService.deletePizza(pizza.id);

      setSuccess("Pizza supprimée avec succès.");
      await fetchPizzas();
    } catch (err) {
      console.error("Erreur suppression pizza :", err);
      setError("Impossible de supprimer cette pizza.");
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    return `${API_IMAGE_BASE_URL}${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminNavbar />

        <div className="admin-content">
          <div className="admin-page-header">
            <div>
              <h1>Gestion des pizzas</h1>
              <p>Ajouter, modifier et supprimer les pizzas du menu.</p>
            </div>

            <Button onClick={openAddModal}>
              <Plus size={18} />
              Ajouter une pizza
            </Button>
          </div>

          {error && (
            <div className="admin-alert admin-alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-alert admin-alert-success">
              {success}
            </div>
          )}

          {loading ? (
            <Loader />
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Disponibilité</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pizzas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucune pizza disponible.
                      </td>
                    </tr>
                  ) : (
                    pizzas.map((pizza) => (
                      <tr key={pizza.id}>
                        <td>
                          {pizza.imageUrl ? (
                            <img
                              src={getImageUrl(pizza.imageUrl)}
                              alt={pizza.name}
                              className="admin-pizza-image"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Pizza size={32} />
                          )}
                        </td>

                        <td>
                          <strong>{pizza.name}</strong>
                          <p>{pizza.description}</p>
                        </td>

                        <td>{pizza.category || "-"}</td>

                        <td>
                          {Number(pizza.price).toFixed(2)}
                        </td>

                        <td>
                          <span
                            className={
                              pizza.available
                                ? "status-badge status-active"
                                : "status-badge status-inactive"
                            }
                          >
                            {pizza.available
                              ? "Disponible"
                              : "Indisponible"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => openEditModal(pizza)}
                              title="Modifier"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(pizza)}
                              title="Supprimer"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>
                {editingPizza ? "Modifier la pizza" : "Ajouter une pizza"}
              </h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                label="Nom de la pizza"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex : Margherita"
              />

              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la pizza"
              />

              <Input
                label="Prix"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex : 18.00"
              />

              <Input
                label="URL de l'image"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="/images/pizzas/Margherita.jpg"
              />

              {formData.imageUrl && (
                <div className="pizza-image-preview">
                  <p>Aperçu de l'image :</p>
                  <img
                    src={getImageUrl(formData.imageUrl)}
                    alt="Aperçu pizza"
                    style={{
                      width: "150px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}

              <Input
                label="Catégorie"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Ex : Classique"
              />

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                Pizza disponible
              </label>

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                >
                  Annuler
                </Button>

                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Enregistrement..."
                    : editingPizza
                    ? "Modifier"
                    : "Ajouter"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePizzas;

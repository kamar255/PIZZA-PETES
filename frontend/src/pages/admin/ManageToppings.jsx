
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

import toppingService from "../../services/toppingService";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "0",
  available: true,
};

function ManageToppings() {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState(null);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);

  const fetchToppings = useCallback(async () => {
    try {
      setError("");

      const response = await toppingService.getAllToppings();
      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setToppings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement garnitures :", err);
      setError(
        err.response?.data?.message ||
        "Impossible de charger les garnitures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeToppings() {
      try {
        const response = await toppingService.getAllToppings();
        const data = Array.isArray(response)
          ? response
          : response?.data || [];

        if (isMounted) {
          setToppings(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        console.error("Erreur chargement garnitures :", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Impossible de charger les garnitures."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeToppings();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingTopping(null);
    setFormData({ ...INITIAL_FORM });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (topping) => {
    setEditingTopping(topping);

    setFormData({
      name: topping.name || "",
      description: topping.description || "",
      price: String(topping.price ?? 0),
      available: topping.available ?? true,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setEditingTopping(null);
    setFormData({ ...INITIAL_FORM });
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
      setError("Le nom de la garniture est obligatoire.");
      return;
    }

    if (formData.price === "") {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    const toppingData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      available: formData.available,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingTopping) {
        await toppingService.updateTopping(
          editingTopping.id,
          toppingData
        );
        setSuccess("Garniture modifiée avec succès.");
      } else {
        await toppingService.createTopping(toppingData);
        setSuccess("Garniture ajoutée avec succès.");
      }

      setIsModalOpen(false);
      setEditingTopping(null);
      setFormData({ ...INITIAL_FORM });

      await fetchToppings();
    } catch (err) {
      console.error("Erreur sauvegarde garniture :", err);
      setError(
        err.response?.data?.message ||
        "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (topping) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la garniture "${topping.name}" ?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await toppingService.deleteTopping(topping.id);

      setSuccess("Garniture supprimée avec succès.");
      await fetchToppings();
    } catch (err) {
      console.error("Erreur suppression garniture :", err);
      setError(
        err.response?.data?.message ||
        "Impossible de supprimer cette garniture."
      );
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminNavbar />

        <div className="admin-content">
          <div className="admin-page-header">
            <div>
              <h1>Gestion des garnitures</h1>
              <p>Ajouter, modifier et supprimer les garnitures.</p>
            </div>

            <Button onClick={openAddModal}>
              <Plus size={18} />
              Ajouter une garniture
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
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Prix</th>
                    <th>Disponibilité</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {toppings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Aucune garniture disponible.
                      </td>
                    </tr>
                  ) : (
                    toppings.map((topping) => (
                      <tr key={topping.id}>
                        <td>
                          <strong>{topping.name}</strong>
                        </td>

                        <td>{topping.description || "-"}</td>

                        <td>
                          {Number(topping.price ?? 0).toFixed(2)}
                        </td>

                        <td>
                          <span
                            className={
                              topping.available
                                ? "status-badge status-active"
                                : "status-badge status-inactive"
                            }
                          >
                            {topping.available
                              ? "Disponible"
                              : "Indisponible"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => openEditModal(topping)}
                              title="Modifier"
                              aria-label={`Modifier ${topping.name}`}
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(topping)}
                              title="Supprimer"
                              aria-label={`Supprimer ${topping.name}`}
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
                {editingTopping
                  ? "Modifier la garniture"
                  : "Ajouter une garniture"}
              </h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                label="Nom de la garniture"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex : Mozzarella, Olives, Champignons"
                required
              />

              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la garniture"
              />

              <Input
                label="Prix"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex : 2.00"
                min="0"
                step="0.01"
                required
              />

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                Garniture disponible
              </label>

              <div className="admin-modal-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Annuler
                </Button>

                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Enregistrement..."
                    : editingTopping
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

export default ManageToppings;

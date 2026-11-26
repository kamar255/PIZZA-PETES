
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

import doughService from "../../services/doughService";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

const INITIAL_FORM = {
  name: "",
  description: "",
  extraPrice: "0",
  available: true,
};

function ManageDoughs() {
  const [doughs, setDoughs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDough, setEditingDough] = useState(null);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoughs = useCallback(async () => {
    try {
      setError("");

      const response = await doughService.getAllDoughs();
      const data = Array.isArray(response)
        ? response
        : response?.data || [];

      setDoughs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement pâtes :", err);
      setError(
        err.response?.data?.message ||
        "Impossible de charger les pâtes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeDoughs() {
      try {
        const response = await doughService.getAllDoughs();
        const data = Array.isArray(response)
          ? response
          : response?.data || [];

        if (isMounted) {
          setDoughs(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        console.error("Erreur chargement pâtes :", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Impossible de charger les pâtes."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeDoughs();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingDough(null);
    setFormData({ ...INITIAL_FORM });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (dough) => {
    setEditingDough(dough);

    setFormData({
      name: dough.name || "",
      description: dough.description || "",
      extraPrice: String(dough.extraPrice ?? dough.price ?? 0),
      available: dough.available ?? true,
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setEditingDough(null);
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
      setError("Le nom de la pâte est obligatoire.");
      return;
    }

    if (formData.extraPrice === "") {
      setError("Veuillez saisir un supplément valide.");
      return;
    }

    const extraPrice = Number(formData.extraPrice);

    if (!Number.isFinite(extraPrice) || extraPrice < 0) {
      setError("Veuillez saisir un supplément valide.");
      return;
    }

    const doughData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      extraPrice,
      available: formData.available,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingDough) {
        await doughService.updateDough(editingDough.id, doughData);
        setSuccess("Pâte modifiée avec succès.");
      } else {
        await doughService.createDough(doughData);
        setSuccess("Pâte ajoutée avec succès.");
      }

      setIsModalOpen(false);
      setEditingDough(null);
      setFormData({ ...INITIAL_FORM });

      await fetchDoughs();
    } catch (err) {
      console.error("Erreur sauvegarde pâte :", err);
      setError(
        err.response?.data?.message ||
        "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dough) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la pâte "${dough.name}" ?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await doughService.deleteDough(dough.id);

      setSuccess("Pâte supprimée avec succès.");
      await fetchDoughs();
    } catch (err) {
      console.error("Erreur suppression pâte :", err);
      setError(
        err.response?.data?.message ||
        "Impossible de supprimer cette pâte."
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
              <h1>Gestion des pâtes</h1>
              <p>Ajouter, modifier et supprimer les types de pâtes.</p>
            </div>

            <Button onClick={openAddModal}>
              <Plus size={18} />
              Ajouter une pâte
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
                    <th>Supplément</th>
                    <th>Disponibilité</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {doughs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Aucune pâte disponible.
                      </td>
                    </tr>
                  ) : (
                    doughs.map((dough) => (
                      <tr key={dough.id}>
                        <td>
                          <strong>{dough.name}</strong>
                        </td>

                        <td>{dough.description || "-"}</td>

                        <td>
                          {Number(
                            dough.extraPrice ?? dough.price ?? 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          <span
                            className={
                              dough.available
                                ? "status-badge status-active"
                                : "status-badge status-inactive"
                            }
                          >
                            {dough.available
                              ? "Disponible"
                              : "Indisponible"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => openEditModal(dough)}
                              title="Modifier"
                              aria-label={`Modifier ${dough.name}`}
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(dough)}
                              title="Supprimer"
                              aria-label={`Supprimer ${dough.name}`}
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
                {editingDough ? "Modifier la pâte" : "Ajouter une pâte"}
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
                label="Nom de la pâte"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex : Fine, Épaisse, Sans gluten"
                required
              />

              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la pâte"
              />

              <Input
                label="Supplément de prix"
                name="extraPrice"
                type="number"
                value={formData.extraPrice}
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
                Pâte disponible
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
                    : editingDough
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

export default ManageDoughs;
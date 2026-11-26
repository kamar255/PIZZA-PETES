
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import sizeService from "../../services/sizeService";

function ManageSizes() {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const initialForm = {
    name: "",
    description: "",
    extraPrice: "0",
    available: true,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    let isMounted = true;

    async function loadSizes() {
      try {
        const data = await sizeService.getAllSizes();

        if (isMounted) {
          setSizes(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Impossible de charger les tailles."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSizes();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    setMessage("");
    setError("");
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (size) => {
    setMessage("");
    setError("");
    setEditingId(size.id);
    setFormData({
      name: size.name || "",
      description: size.description || "",
      extraPrice: String(size.extraPrice ?? size.price ?? 0),
      available: size.available ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const name = formData.name.trim();
    const extraPrice = Number(formData.extraPrice);

    if (!name) {
      setError("Le nom de la taille est obligatoire.");
      return;
    }

    if (
      formData.extraPrice === "" ||
      !Number.isFinite(extraPrice) ||
      extraPrice < 0
    ) {
      setError("Le prix supplémentaire doit être un nombre positif.");
      return;
    }

    const payload = {
      name,
      description: formData.description.trim(),
      extraPrice,
      available: formData.available,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await sizeService.updateSize(editingId, payload);
        setMessage("Taille modifiée avec succès.");
      } else {
        await sizeService.createSize(payload);
        setMessage("Taille ajoutée avec succès.");
      }

      const updatedSizes = await sizeService.getAllSizes();
      setSizes(Array.isArray(updatedSizes) ? updatedSizes : []);

      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Une erreur est survenue pendant l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette taille ?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await sizeService.deleteSize(id);

      setSizes((previous) =>
        previous.filter((size) => size.id !== id)
      );

      setMessage("Taille supprimée avec succès.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Impossible de supprimer cette taille."
      );
    }
  };

  return (
    <div className="admin-page manage-sizes">
      <div className="admin-page-header">
        <div>
          <h1>Gestion des tailles</h1>
          <p>Gérez les tailles disponibles pour vos pizzas.</p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={handleAdd}
        >
          <Plus size={18} />
          Ajouter une taille
        </button>
      </div>

      {message && (
        <div className="admin-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="admin-form-card">
          <div className="admin-form-header">
            <h2>
              {editingId !== null
                ? "Modifier la taille"
                : "Ajouter une taille"}
            </h2>

            <button
              type="button"
              className="admin-close-button"
              onClick={resetForm}
              disabled={saving}
              aria-label="Fermer le formulaire"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="size-name">Nom de la taille</label>
              <input
                id="size-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Exemple : Petite, Moyenne, Grande"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="size-description">Description</label>
              <textarea
                id="size-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la taille"
                rows={3}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="size-price">
                Prix supplémentaire
              </label>
              <input
                id="size-price"
                type="number"
                name="extraPrice"
                value={formData.extraPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="admin-form-checkbox">
              <input
                id="size-available"
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
              <label htmlFor="size-available">
                Taille disponible
              </label>
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Enregistrement..."
                  : editingId !== null
                    ? "Enregistrer les modifications"
                    : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>Liste des tailles</h2>
          <span>{sizes.length} taille(s)</span>
        </div>

        {loading ? (
          <p className="admin-loading">Chargement des tailles...</p>
        ) : sizes.length === 0 ? (
          <p className="admin-empty">
            Aucune taille enregistrée.
          </p>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Prix supplémentaire</th>
                  <th>Disponibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sizes.map((size) => (
                  <tr key={size.id}>
                    <td>{size.name}</td>
                    <td>{size.description || "—"}</td>
                    <td>
                      {Number(
                        size.extraPrice ?? size.price ?? 0
                      ).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={
                          size.available
                            ? "admin-status available"
                            : "admin-status unavailable"
                        }
                      >
                        {size.available
                          ? "Disponible"
                          : "Indisponible"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() => handleEdit(size)}
                          aria-label={`Modifier ${size.name}`}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => handleDelete(size.id)}
                          aria-label={`Supprimer ${size.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageSizes;

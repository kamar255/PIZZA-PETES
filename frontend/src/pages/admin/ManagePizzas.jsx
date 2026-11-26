
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Pizza,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

import pizzaService from "../../services/pizzaService";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "",
  available: true,
};

// Nettoyer et normaliser le chemin avant l'enregistrement
const normalizeImagePath = (value) => {
  if (!value) return "";

  const path = value.trim();

  // URL Internet : conserver telle quelle
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Accepter public/images/... ou /images/...
  let cleanPath = path.replace(/^\/+/, "");
  cleanPath = cleanPath.replace(/^public\//i, "");

  return `/${cleanPath}`;
};

// Construire l'adresse utilisée par le navigateur
const getImageUrl = (value) => {
  const path = normalizeImagePath(value);

  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return (
    window.location.origin +
    path
      .split("/")
      .map((part, index) =>
        index === 0 ? "" : encodeURIComponent(part)
      )
      .join("/")
  );
};

// Accepter les chemins locaux et les URL Internet
const isValidImagePath = (value) => {
  if (!value || !value.trim()) return true;

  const path = value.trim();

  const isInternetUrl = /^https?:\/\/\S+$/i.test(path);

  const isLocalImage =
    /^\/?public\/?images\/pizzas\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(path) ||
    /^\/?images\/pizzas\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(path);

  return isInternetUrl || isLocalImage;
};

function ManagePizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // Chargement initial des pizzas
  useEffect(() => {
    let isMounted = true;

    const initializePizzas = async () => {
      try {
        setError("");

        const response = await pizzaService.getAllPizzas();

        if (isMounted) {
          setPizzas(Array.isArray(response) ? response : []);
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

  // Recharger les pizzas après une opération
  const fetchPizzas = async () => {
    try {
      const response = await pizzaService.getAllPizzas();
      setPizzas(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Erreur actualisation pizzas :", err);
      setError("Impossible d'actualiser les pizzas.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPizzas();
    setRefreshing(false);
  };

  // Ajouter une pizza
  const openAddModal = () => {
    setEditingPizza(null);
    setForm(INITIAL_FORM);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // Modifier une pizza
  const openEditModal = (pizza) => {
    setEditingPizza(pizza);

    setForm({
      name: pizza.name || "",
      description: pizza.description || "",
      price: pizza.price ?? "",
      imageUrl: pizza.imageUrl || "",
      category: pizza.category || "",
      available: pizza.available ?? true,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingPizza(null);
    setForm(INITIAL_FORM);
    setError("");
  };

  // Gestion des champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Enregistrement
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Le nom de la pizza est obligatoire.");
      return;
    }

    if (form.price === "" || Number(form.price) <= 0) {
      setError("Le prix doit être supérieur à zéro.");
      return;
    }

    if (!isValidImagePath(form.imageUrl)) {
      setError(
        "Le chemin de l'image est incorrect. Utilise /images/pizzas/nom-image.jpg ou une URL Internet."
      );
      return;
    }

    const pizzaData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: normalizeImagePath(form.imageUrl),
      category: form.category.trim(),
      available: form.available,
    };

    try {
      setSaving(true);

      if (editingPizza) {
        await pizzaService.updatePizza(editingPizza.id, pizzaData);
        setSuccess("Pizza modifiée avec succès.");
      } else {
        await pizzaService.createPizza(pizzaData);
        setSuccess("Pizza ajoutée avec succès.");
      }

      setModalOpen(false);
      setEditingPizza(null);
      setForm(INITIAL_FORM);

      await fetchPizzas();
    } catch (err) {
      console.error("Erreur enregistrement pizza :", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Une erreur est survenue pendant l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  };

  // Suppression
  const handleDelete = async (pizza) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la pizza "${pizza.name}" ?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(pizza.id);
      setError("");
      setSuccess("");

      await pizzaService.deletePizza(pizza.id);

      setPizzas((previous) =>
        previous.filter((item) => item.id !== pizza.id)
      );

      setSuccess("Pizza supprimée avec succès.");
    } catch (err) {
      console.error("Erreur suppression pizza :", err);
      setError("Impossible de supprimer cette pizza.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-layout pizzas-page">
      <AdminSidebar />

      <main className="admin-main">
        <AdminNavbar />

        <div className="pizzas-content">
          <style>{`
            .pizzas-page {
              min-height: 100vh;
              background: #f7f5f0;
              color: #302820;
            }

            .pizzas-content {
              max-width: 1500px;
              margin: 0 auto;
              padding: 30px;
            }

            .pizzas-heading {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
              margin-bottom: 28px;
            }

            .pizzas-heading h1 {
              margin: 0 0 7px;
              font-family: Georgia, serif;
              font-size: 30px;
              color: #302820;
            }

            .pizzas-heading p {
              margin: 0;
              color: #887d70;
              font-size: 14px;
            }

            .pizzas-primary-btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 9px;
              border: 0;
              border-radius: 7px;
              padding: 12px 18px;
              background: #a83d2b;
              color: white;
              font-weight: 600;
              cursor: pointer;
            }

            .pizzas-primary-btn:hover {
              background: #873021;
            }

            .pizzas-message {
              padding: 12px 16px;
              border-radius: 6px;
              margin-bottom: 18px;
              font-size: 14px;
            }

            .pizzas-error {
              background: #fbe9e5;
              color: #a33224;
            }

            .pizzas-success {
              background: #e9f2e8;
              color: #386b3d;
            }

            .pizzas-toolbar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              color: #786e62;
              font-size: 14px;
            }

            .pizzas-refresh {
              display: flex;
              align-items: center;
              gap: 7px;
              border: 1px solid #ded5c8;
              background: transparent;
              color: #64584b;
              padding: 8px 13px;
              border-radius: 6px;
              cursor: pointer;
            }

            .pizzas-table-wrap {
              overflow-x: auto;
              border: 1px solid #e8e0d5;
              border-radius: 9px;
              background: #fbfaf7;
            }

            .pizzas-table {
              width: 100%;
              border-collapse: collapse;
              min-width: 750px;
            }

            .pizzas-table th {
              text-align: left;
              padding: 16px;
              color: #817466;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 1px solid #e8e0d5;
              background: #f3efe8;
            }

            .pizzas-table td {
              padding: 14px 16px;
              border-bottom: 1px solid #eee8df;
              font-size: 14px;
              vertical-align: middle;
            }

            .pizzas-table tr:last-child td {
              border-bottom: 0;
            }

            .pizzas-table tr:hover td {
              background: #f8f4ed;
            }

            .pizza-image {
              width: 62px;
              height: 55px;
              object-fit: cover;
              border-radius: 6px;
              background: #eee7dc;
              display: block;
            }

            .pizza-image-placeholder {
              width: 62px;
              height: 55px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
              background: #eee7dc;
              color: #a18c72;
            }

            .pizza-name {
              font-weight: 700;
              color: #392e25;
            }

            .pizza-category {
              color: #897b6b;
            }

            .pizza-price {
              color: #9c432f;
              font-weight: 700;
              white-space: nowrap;
            }

            .pizza-status {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
            }

            .pizza-status.available {
              background: #e7f1e6;
              color: #47734a;
            }

            .pizza-status.unavailable {
              background: #f6e7e3;
              color: #a34a39;
            }

            .pizza-actions {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .pizza-action-btn {
              width: 34px;
              height: 34px;
              border: 1px solid #e4dbcf;
              border-radius: 6px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background: transparent;
              color: #786b5c;
              cursor: pointer;
            }

            .pizza-action-btn:hover {
              background: #eee8df;
            }

            .pizza-action-btn.delete:hover {
              color: #b33e2e;
              background: #f8e8e4;
            }

            .pizza-empty {
              text-align: center;
              padding: 50px 20px;
              color: #8b7d6c;
            }

            .pizza-modal-overlay {
              position: fixed;
              inset: 0;
              z-index: 1000;
              background: rgba(35, 28, 22, .55);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              overflow-y: auto;
            }

            .pizza-modal {
              width: 100%;
              max-width: 570px;
              background: #fbfaf7;
              border: 1px solid #e6dccf;
              border-radius: 10px;
              padding: 27px;
              box-shadow: 0 20px 60px rgba(0,0,0,.2);
              margin: auto;
            }

            .pizza-modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 23px;
            }

            .pizza-modal-header h2 {
              margin: 0;
              font-family: Georgia, serif;
              font-size: 23px;
              color: #382d24;
            }

            .pizza-modal-close {
              border: 0;
              background: transparent;
              color: #76695c;
              cursor: pointer;
            }

            .pizza-form {
              display: grid;
              gap: 15px;
            }

            .pizza-form-group {
              display: flex;
              flex-direction: column;
              gap: 7px;
            }

            .pizza-form-group label {
              font-size: 13px;
              font-weight: 600;
              color: #625548;
            }

            .pizza-form-group input,
            .pizza-form-group textarea {
              width: 100%;
              box-sizing: border-box;
              border: 1px solid #ded5c8;
              border-radius: 6px;
              padding: 11px 12px;
              background: white;
              color: #302820;
              font: inherit;
              outline: none;
            }

            .pizza-form-group input:focus,
            .pizza-form-group textarea:focus {
              border-color: #b58a50;
              box-shadow: 0 0 0 2px rgba(181,138,80,.12);
            }

            .pizza-form-group textarea {
              min-height: 85px;
              resize: vertical;
            }

            .pizza-form-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 13px;
            }

            .pizza-image-preview {
              display: flex;
              align-items: center;
              gap: 12px;
              color: #8a7b6b;
              font-size: 12px;
            }

            .pizza-image-preview img {
              width: 75px;
              height: 65px;
              object-fit: cover;
              border-radius: 6px;
              background: #eee7dc;
            }

            .pizza-available-check {
              display: flex;
              align-items: center;
              gap: 9px;
              color: #625548;
              font-size: 13px;
            }

            .pizza-modal-actions {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              margin-top: 8px;
            }

            .pizza-cancel-btn {
              border: 1px solid #ded5c8;
              border-radius: 6px;
              padding: 11px 17px;
              background: transparent;
              color: #6e6255;
              cursor: pointer;
            }

            .pizza-save-btn {
              border: 0;
              border-radius: 6px;
              padding: 11px 18px;
              background: #a83d2b;
              color: white;
              font-weight: 600;
              cursor: pointer;
            }

            .pizza-save-btn:disabled {
              opacity: .6;
              cursor: not-allowed;
            }

            @media (max-width: 700px) {
              .pizzas-content {
                padding: 18px;
              }

              .pizzas-heading {
                align-items: flex-start;
                flex-direction: column;
              }

              .pizza-modal {
                padding: 20px;
              }

              .pizza-form-row {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <div className="pizzas-heading">
            <div>
              <h1>Gestion des pizzas</h1>
              <p>Gérez les pizzas, leurs prix et leurs images.</p>
            </div>

            <button className="pizzas-primary-btn" onClick={openAddModal}>
              <Plus size={18} />
              Ajouter une pizza
            </button>
          </div>

          {error && (
            <div className="pizzas-message pizzas-error">{error}</div>
          )}

          {success && (
            <div className="pizzas-message pizzas-success">{success}</div>
          )}

          <div className="pizzas-toolbar">
            <span>{pizzas.length} pizza(s)</span>

            <button
              className="pizzas-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={15} />
              {refreshing ? "Actualisation..." : "Actualiser"}
            </button>
          </div>

          {loading ? (
            <div className="pizza-empty">Chargement des pizzas...</div>
          ) : pizzas.length === 0 ? (
            <div className="pizza-empty">
              <Pizza size={38} />
              <p>Aucune pizza disponible.</p>
            </div>
          ) : (
            <div className="pizzas-table-wrap">
              <table className="pizzas-table">
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
                  {pizzas.map((pizza) => {
                    const imageUrl = getImageUrl(pizza.imageUrl);

                    return (
                      <tr key={pizza.id}>
                        <td>
                          {imageUrl ? (
                            <img
                              className="pizza-image"
                              src={imageUrl}
                              alt={pizza.name}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="pizza-image-placeholder">
                              <ImageIcon size={22} />
                            </div>
                          )}
                        </td>

                        <td>
                          <span className="pizza-name">{pizza.name}</span>
                        </td>

                        <td className="pizza-category">
                          {pizza.category || "—"}
                        </td>

                        <td className="pizza-price">
                          {Number(pizza.price).toFixed(2)} DT
                        </td>

                        <td>
                          <span
                            className={`pizza-status ${
                              pizza.available ? "available" : "unavailable"
                            }`}
                          >
                            {pizza.available
                              ? "Disponible"
                              : "Indisponible"}
                          </span>
                        </td>

                        <td>
                          <div className="pizza-actions">
                            <button
                              className="pizza-action-btn"
                              title="Modifier"
                              onClick={() => openEditModal(pizza)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="pizza-action-btn delete"
                              title="Supprimer"
                              disabled={deletingId === pizza.id}
                              onClick={() => handleDelete(pizza)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <div className="pizza-modal-overlay">
          <div className="pizza-modal">
            <div className="pizza-modal-header">
              <h2>
                {editingPizza ? "Modifier la pizza" : "Ajouter une pizza"}
              </h2>

              <button
                className="pizza-modal-close"
                onClick={closeModal}
                disabled={saving}
                type="button"
              >
                <X size={21} />
              </button>
            </div>

            <form className="pizza-form" onSubmit={handleSubmit}>
              <div className="pizza-form-group">
                <label htmlFor="pizza-name">Nom de la pizza *</label>
                <input
                  id="pizza-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex : 4 Fromages"
                  required
                />
              </div>

              <div className="pizza-form-group">
                <label htmlFor="pizza-description">Description</label>
                <textarea
                  id="pizza-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description de la pizza..."
                />
              </div>

              <div className="pizza-form-row">
                <div className="pizza-form-group">
                  <label htmlFor="pizza-price">Prix (DT) *</label>
                  <input
                    id="pizza-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Ex : 18.00"
                    required
                  />
                </div>

                <div className="pizza-form-group">
                  <label htmlFor="pizza-category">Catégorie</label>
                  <input
                    id="pizza-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Ex : Classique"
                  />
                </div>
              </div>

              <div className="pizza-form-group">
                <label htmlFor="pizza-image">
                  Chemin de l'image ou URL Internet
                </label>

                <input
                  id="pizza-image"
                  name="imageUrl"
                  type="text"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="/images/pizzas/4 Fromages.jpg"
                />

                {form.imageUrl.trim() && (
                  <div className="pizza-image-preview">
                    <img
                      src={getImageUrl(form.imageUrl)}
                      alt="Aperçu de la pizza"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span>Aperçu de l'image</span>
                  </div>
                )}
              </div>

              <label className="pizza-available-check">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                />
                Pizza disponible à la commande
              </label>

              <div className="pizza-modal-actions">
                <button
                  type="button"
                  className="pizza-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="pizza-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : editingPizza
                    ? "Enregistrer les modifications"
                    : "Ajouter la pizza"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePizzas;

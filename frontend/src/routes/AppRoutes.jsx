
import { Routes, Route } from "react-router-dom";

// Pages client
import Home from "../pages/client/Home";
import Menu from "../pages/client/Menu";
import Profile from "../pages/client/Profile";
import EditProfile from "../pages/client/EditProfile";
import Orders from "../pages/client/Orders";

// Pages authentification
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Pages administrateur
import Dashboard from "../pages/admin/Dashboard";
import ManagePizzas from "../pages/admin/ManagePizzas";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageUsers from "../pages/admin/ManageUsers";

// Protection des routes
import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>

      {/* ========================= */}
      {/*       PAGES PUBLIQUES     */}
      {/* ========================= */}

      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* ========================= */}
      {/*       ESPACE CLIENT       */}
      {/* ========================= */}

      <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/orders" element={<Orders />} />
      </Route>


      {/* ========================= */}
      {/*   ESPACE ADMINISTRATEUR   */}
      {/* ========================= */}

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/admin/pizzas"
          element={<ManagePizzas />}
        />

        <Route
          path="/admin/orders"
          element={<ManageOrders />}
        />

        <Route
          path="/admin/users"
          element={<ManageUsers />}
        />
      </Route>

    </Routes>
  );
}

export default AppRoutes;

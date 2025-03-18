
import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { SubscriptionRoute } from "./SubscriptionRoute";

// Protected Pages - Fixed import paths with correct capitalization
import TableauDeBord from "@/pages/TableauDeBord";
import Account from "@/pages/Account";
import EditProfile from "@/pages/EditProfile";
import Billing from "@/pages/Billing";
import ApiKeyPage from "@/pages/ApiKeyPage";

export const ProtectedRoutes = () => {
  return (
    <>
      <Route
        path="/tableaudebord"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <TableauDeBord />
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-key"
        element={
          <ProtectedRoute>
            <SubscriptionRoute>
              <ApiKeyPage />
            </SubscriptionRoute>
          </ProtectedRoute>
        }
      />
    </>
  );
};

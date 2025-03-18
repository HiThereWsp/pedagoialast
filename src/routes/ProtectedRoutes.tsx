
import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { SubscriptionRoute } from "./SubscriptionRoute";

// Protected Pages - Using available components from TableauDeBord.tsx
import TableauDeBord from "@/pages/TableauDeBord";

// Placeholder components for missing pages
const Account = () => <div className="p-8">Account Page - Coming Soon</div>;
const EditProfile = () => <div className="p-8">Edit Profile Page - Coming Soon</div>;
const Billing = () => <div className="p-8">Billing Page - Coming Soon</div>;
const ApiKeyPage = () => <div className="p-8">API Key Page - Coming Soon</div>;

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


import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { SubscriptionRoute } from "./SubscriptionRoute";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

// Protected Pages - Using available components from TableauDeBord.tsx
import TableauDeBord from "@/pages/TableauDeBord";

// Placeholder components for missing pages
const Account = () => (
  <ProtectedLayout>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <p className="text-gray-600">Account management page - Coming Soon</p>
    </div>
  </ProtectedLayout>
);

const EditProfile = () => (
  <ProtectedLayout>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <p className="text-gray-600">Profile editing functionality - Coming Soon</p>
    </div>
  </ProtectedLayout>
);

const Billing = () => (
  <ProtectedLayout>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Billing</h1>
      <p className="text-gray-600">Billing and subscription management - Coming Soon</p>
    </div>
  </ProtectedLayout>
);

const ApiKeyPage = () => (
  <ProtectedLayout>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Keys</h1>
      <p className="text-gray-600">API key management - Coming Soon</p>
    </div>
  </ProtectedLayout>
);

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

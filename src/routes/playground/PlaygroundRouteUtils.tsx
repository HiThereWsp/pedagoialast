
import React from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";
import { SubscriptionRoute } from "../SubscriptionRoute";

type PlaygroundRouteProps = {
  startIndex: number;
  endIndex: number;
};

export const generatePlaygroundRoutes = ({ startIndex, endIndex }: PlaygroundRouteProps) => {
  const routes = [];

  for (let i = startIndex; i <= endIndex; i++) {
    // For the base Playground (no version number)
    if (i === 1) {
      try {
        const Playground = require("@/pages/Playground").default;
        routes.push(
          <Route
            key={`playground`}
            path={`/playground`}
            element={
              <ProtectedRoute>
                <SubscriptionRoute>
                  <Playground />
                </SubscriptionRoute>
              </ProtectedRoute>
            }
          />
        );
      } catch (e) {
        console.warn(`Could not load Playground`);
      }
      continue;
    }

    // Dynamically import the playground component
    try {
      const PlaygroundComponent = require(`@/pages/PlaygroundV${i}`).default;
      routes.push(
        <Route
          key={`playground-v${i}`}
          path={`/playground-v${i}`}
          element={
            <ProtectedRoute>
              <SubscriptionRoute>
                <PlaygroundComponent />
              </SubscriptionRoute>
            </ProtectedRoute>
          }
        />
      );
    } catch (e) {
      console.warn(`Could not load PlaygroundV${i}`);
    }
  }

  return routes;
};

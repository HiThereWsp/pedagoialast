
import React from "react";
import { generatePlaygroundRoutes } from "./PlaygroundRouteUtils";

export const PlaygroundRoutes1 = () => {
  return <>{generatePlaygroundRoutes({ startIndex: 1, endIndex: 100 })}</>;
};

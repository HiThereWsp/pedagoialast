
import React from "react";
import { generatePlaygroundRoutes } from "./PlaygroundRouteUtils";

export const PlaygroundRoutes3 = () => {
  return <>{generatePlaygroundRoutes({ startIndex: 201, endIndex: 300 })}</>;
};

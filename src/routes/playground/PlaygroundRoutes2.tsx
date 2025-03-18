
import React from "react";
import { generatePlaygroundRoutes } from "./PlaygroundRouteUtils";

export const PlaygroundRoutes2 = () => {
  return <>{generatePlaygroundRoutes({ startIndex: 101, endIndex: 200 })}</>;
};

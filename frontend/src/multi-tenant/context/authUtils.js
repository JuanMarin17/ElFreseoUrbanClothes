import { useContext } from "react";
import { AuthContext } from "./authContext.js";

export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  OWNER:      "OWNER",
  ADMIN:      "ADMIN",
  STAFF:      "STAFF",
};

export const useAuth = () => useContext(AuthContext);

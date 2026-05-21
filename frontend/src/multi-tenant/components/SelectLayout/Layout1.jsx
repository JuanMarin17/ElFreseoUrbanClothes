/**
 * Layout1.jsx — Preview al elegir layout en LayoutSelect.
 * Usa StorePreview con datos de demo para mostrar cómo se verá cada layout.
 */
import StorePreview from "./StorePreview";

export const Layout1 = ({ layoutType = "minimalista" }) => {
  return <StorePreview layoutType={layoutType} />;
};

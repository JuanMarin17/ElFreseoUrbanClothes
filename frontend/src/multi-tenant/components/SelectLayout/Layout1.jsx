/**
 * Layout1.jsx — Preview al elegir layout en LayoutSelect.
 * Usa StorePreview con datos de demo para mostrar cómo se verá cada layout.
 */
import StoreFront from "../Store/StoreFront.jsx";

export const Layout1 = ({ layoutType = "minimalista" }) => {
  return <StoreFront layoutType={layoutType} />;
};

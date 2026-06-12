import ProductReviews from "../../reviews/ProductReviews";

export default function TabReviews({ productId, currentUserId, isStoreOwner, onCountChange }) {
  return (
    <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews">
      <ProductReviews
        productId={productId}
        currentUserId={currentUserId}
        isStoreOwner={isStoreOwner ?? false}
        onCountChange={onCountChange}
      />
    </div>
  );
}

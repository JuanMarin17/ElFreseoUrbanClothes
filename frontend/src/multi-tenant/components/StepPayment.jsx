export default function StepPayment({ handleChange }) {
  return (
    <div className="step">
      <select name="paymentMethod" onChange={handleChange}>
        <option>Método de pago</option>
        <option>Wonpy</option>
        <option>Tarjeta credito</option>
      </select>

      <select name="shipping" onChange={handleChange}>
        <option>Tipo envío</option>
        <option>Nacional</option>
      </select>
    </div>
  );
}

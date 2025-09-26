import { Button } from "ui";
import { formatPrice } from "utils";

function App() {
  return (
    <div>
      <h1>Drone FastFood Delivery</h1>
      <p>Giá món ăn: {formatPrice(9.99)}</p>
      <Button label="Đặt hàng ngay" onClick={() => alert("Đã đặt hàng!")} />
    </div>
  );
}

export default App;

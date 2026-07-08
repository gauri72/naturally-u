import { useEffect, useState } from 'react';
import { listOrders, updateOrderStatus } from '../../../api/orders.api';

function OrdersListPage() {
  const [orders, setOrders] = useState([]);

  const load = () => listOrders().then((res) => setOrders(res.data));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
  };

  return (
    <div>
      <h1>Orders</h1>
      <table>
        <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.orderNumber}</td>
              <td>{o.customer?.email}</td>
              <td>€{o.total.toFixed(2)}</td>
              <td>
                <select value={o.orderStatus} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersListPage;

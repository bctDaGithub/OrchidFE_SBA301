import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Dropdown, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../style/OrderTracking.css';

export default function OrderTracking() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user'));
  const accountId = user?.userId;

  const queryUrl = `http://localhost:8080/api/v1/query/order/account/${accountId}`;
  const commandUrl = 'http://localhost:8080/api/v1/command/order';

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to view your orders.');
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(queryUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error.response || error);
      toast.error('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const confirm = window.confirm(`Are you sure you want to cancel order #${orderId}?`);
    if (!confirm) return;

    try {
      await axios.put(`${commandUrl}/${orderId}/CANCELLED`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      toast.success(`Order #${orderId} has been cancelled.`);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error.response || error);
      toast.error('Failed to cancel order.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning">Pending</Badge>;
      case 'CONFIRMED':
        return <Badge bg="info">Confirmed</Badge>;
      case 'COMPLETED':
        return <Badge bg="success">Completed</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const calculateTotal = (orderDetails) => {
    return orderDetails.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  return (
    <Container className="order-tracking-container" style={{ minHeight: '100vh', padding: '20px' }}>
      <Toaster />
      <h2>Order Tracking</h2>

      {/* Filter Dropdown */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        <Col>
          {isLoading ? (
            <p>Loading your orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="mb-3">
                <Card.Body>
                  <Card.Title>Order #{order.id}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Account ID: {order.accountId} | Status: {getStatusBadge(order.status)}
                  </Card.Subtitle>

                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Orchid</th>
                        <th>Quantity</th>
                        <th>Unit Price (VND)</th>
                        <th>Total (VND)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderDetails.map((item) => (
                        <tr key={item.orchidId}>
                          <td>{item.orchidName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unitPrice.toLocaleString('en-US')}</td>
                          <td>{(item.quantity * item.unitPrice).toLocaleString('en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Card.Text>
                    <strong>Total: </strong>{calculateTotal(order.orderDetails).toLocaleString('en-US')} VND
                  </Card.Text>

                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
}

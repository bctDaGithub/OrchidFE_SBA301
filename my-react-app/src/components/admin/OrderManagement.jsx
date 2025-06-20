import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Dropdown, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './style/OrderManagement.css';

export default function OrderManagement() {
  const queryUrl = 'http://localhost:8080/api/v1/query/order';
  const commandUrl = 'http://localhost:8080/api/v1/command/order';
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (isFetching) return;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(queryUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const sortedOrders = response.data.sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err.response || err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    const confirm = window.confirm(`Are you sure you want to update order #${orderId} to ${newStatus}?`);
    if (!confirm) return;

    try {
      await axios.put(`${commandUrl}/${orderId}/${newStatus}`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      toast.success(`Order #${orderId} updated to ${newStatus}`);
      await fetchOrders();
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error.response || error);
      toast.error(`Failed to update order: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  return (
    <Container className="order-management-container" style={{ minHeight: '100vh', padding: '20px' }}>
      <Toaster />
      <h2>Order Management</h2>

      {/* Filter dropdown */}
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
            <p>Loading orders...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
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
                    <strong>Total: </strong>
                    {calculateTotal(order.orderDetails).toLocaleString('en-US')} VND
                  </Card.Text>

                  {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                    <Dropdown onSelect={(status) => updateOrderStatus(order.id, status)}>
                      <Dropdown.Toggle variant="outline-secondary" id={`dropdown-status-${order.id}`}>
                        Update Status
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {order.status === 'PENDING' && (
                          <>
                            <Dropdown.Item eventKey="CONFIRMED">Confirmed</Dropdown.Item>
                            <Dropdown.Item eventKey="CANCELLED">Cancelled</Dropdown.Item>
                          </>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <>
                            <Dropdown.Item eventKey="COMPLETED">Completed</Dropdown.Item>
                            <Dropdown.Item eventKey="CANCELLED">Cancelled</Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
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

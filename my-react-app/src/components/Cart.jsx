import { useEffect, useState } from 'react';
import { Container, Button, Col, Row, Card, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import '../style/Cart.css';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const accessToken = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));
    const commandUrl = 'http://localhost:8080/api/v1/command/order';

    // Decode JWT to check userId and expiration
    const decodeToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error('Error decoding token:', err);
            return null;
        }
    };

    // Load cart items from localStorage
    useEffect(() => {
        const loadCart = () => {
            try {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                console.log('Cart loaded from localStorage:', cart);
                setCartItems(cart);
                setError('');
            } catch (err) {
                setError('Failed to load cart. Please try again.');
                console.error('Error loading cart:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadCart();

        // Listen for cart updates
        const handleCartUpdate = () => loadCart();
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    // Update quantity of an item
    const updateQuantity = (orchidId, newQuantity) => {
        if (newQuantity < 1) return;
        const updatedCart = cartItems.map(item =>
            item.orchidId === orchidId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        console.log('Updated cart:', updatedCart);
    };

    // Remove item from cart
    const removeItem = (orchidId) => {
        const updatedCart = cartItems.filter(item => item.orchidId !== orchidId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
        console.log('Removed item, new cart:', updatedCart);
    };

    // Calculate total price
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Handle checkout
    const handleCheckout = async () => {
        if (!user || !accessToken) {
            toast.error('Please log in to proceed with checkout.');
            navigate('/login');
            return;
        }

        // Decode token to verify
        const decodedToken = decodeToken(accessToken);
        if (!decodedToken || decodedToken.exp * 1000 < Date.now()) {
            toast.error('Session expired. Please log in again.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
        }

        console.log('Decoded token:', decodedToken);
        console.log('User from localStorage:', user);

        const payload = {
  accountId: Number(user.userId), 
  items: cartItems.map(item => ({
    orchidId: Number(item.orchidId),
    quantity: item.quantity
  }))
};

        if (!window.confirm('Are you sure you want to place this order?')) return;

        try {
            console.log('Creating order with payload:', payload);
            console.log('Authorization header:', `Bearer ${accessToken}`);
            const response = await axios.post(commandUrl, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Order creation response:', response.data);
            toast.success('Order placed successfully!');
            localStorage.removeItem('cart');
            setCartItems([]);
            window.dispatchEvent(new Event('cartUpdated'));
            navigate('/order-tracking');
        } catch (error) {
            console.error('Error creating order:', error.response || error);
            const errorMessage = error.response?.data?.message || 
                (error.response?.status === 403 ? 
                    `Access denied. Ensure accountId (${payload.accountId}) matches your user ID (${decodedToken.userId}).` : 
                    (error.response?.status === 401 ? 
                        'Unauthorized. Please log in again.' : 
                        'Failed to place order. Please try again.'));
            toast.error(errorMessage);
            console.log('Error details:', error.response?.data || error.message);
            if (error.response?.status === 403 || error.response?.status === 401) {
                toast.error('Session may be invalid. Please log in again.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    };

    if (isLoading) {
        return (
            <Container>
                <Toaster />
                Loading...
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Toaster />
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Container>
                <Toaster />
                <Alert variant="info">Your cart is empty.</Alert>
            </Container>
        );
    }

    return (
        <Container className="cart-container" style={{ minHeight: '100vh', padding: '20px' }}>
            <Toaster />
            <h2>Your Cart</h2>
            <Row>
                <Col md={8}>
                    {cartItems.map(item => (
                        <Card key={item.orchidId} className="mb-3">
                            <Card.Body>
                                <Row>
                                    <Col md={3}>
                                        <Card.Img
                                            src={item.orchidUrl || 'https://via.placeholder.com/150'}
                                            alt={item.orchidName || 'Orchid Image'}
                                            style={{ height: '100px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                console.log(`Image failed to load: ${item.orchidUrl}`);
                                                e.target.src = 'https://via.placeholder.com/150';
                                            }}
                                        />
                                    </Col>
                                    <Col md={5}>
                                        <Card.Title>{item.orchidName || 'N/A'}</Card.Title>
                                        <Card.Text>
                                            <strong>Price:</strong> {item.price ? item.price.toLocaleString('en-US') : 'N/A'} VND
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Total:</strong> {(item.price * item.quantity).toLocaleString('en-US')} VND
                                        </Card.Text>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quantity</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.orchidId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </Button>
                                                <Form.Control
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.orchidId, parseInt(e.target.value) || 1)}
                                                    style={{ width: '60px', textAlign: 'center', margin: '0 10px' }}
                                                    min="1"
                                                />
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.orchidId, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </Form.Group>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeItem(item.orchidId)}
                                        >
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Order Summary</Card.Title>
                            <Card.Text>
                                <strong>Total:</strong> {calculateTotal().toLocaleString('en-US')} VND
                            </Card.Text>
                            <Button
                                variant="primary"
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                            >
                                Proceed to Checkout
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
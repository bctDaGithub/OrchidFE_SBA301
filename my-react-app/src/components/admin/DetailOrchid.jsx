import { useEffect, useState } from 'react';
import { Container, Button, Col, Row, Card, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './style/DetailOrchid.css';

export default function DetailOrchid() {
    const [orchid, setOrchid] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { id } = useParams();
    const navigate = useNavigate();

    const baseUrl = 'http://localhost:8080/api/v1/query/orchid';
    const accessToken = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchData = async () => {
        if (!user || !accessToken) {
            toast.error('Please log in to view this page.');
            navigate('/login');
            return;
        }

        if (!id) {
            setError('No ID found in URL');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log(`Fetching orchid with ID: ${id} from ${baseUrl}/${id}`);
            const response = await axios.get(`${baseUrl}/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setOrchid(response.data);
            setError(null);
            console.log('Fetched orchid:', response.data);
        } catch (error) {
            console.error('Error fetching orchid data:', error.response || error);
            const errorMessage = error.response?.data?.message || 'Failed to fetch orchid data. Please try again later.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = () => {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.orchidId === orchid.orchidId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ ...orchid, quantity: parseInt(quantity) });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            toast.success(`Added ${quantity} ${orchid.orchidName} to cart!`);
            setQuantity(1);
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.error('Failed to add to cart. Please try again.');
        }
    };

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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

    return (
        <Container className="detail-container" style={{ minHeight: '100vh' }}>
            <Toaster />
            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <Card.Title>{orchid.orchidName || 'N/A'}</Card.Title>
                            <Card.Text>{orchid.orchidDescription || 'No description available'}</Card.Text>
                            <Card.Text>
                                <strong>Price:</strong> {orchid.price ? orchid.price.toLocaleString('en-US') : 'N/A'} VND
                            </Card.Text>
                            <Card.Text>
                                <strong>Type:</strong> {orchid.natural ? 'Natural' : 'Industrial'}
                            </Card.Text>
                            <Card.Text>
                                <strong>Status:</strong> {orchid.available ? 'Available' : 'Unavailable'}
                            </Card.Text>

                            <Form.Group className="mb-3">
                                <Form.Label>Quantity</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </Button>
                                    <Form.Control
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                        style={{ width: '60px', textAlign: 'center', margin: '0 10px' }}
                                        min="1"
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                            </Form.Group>

                            <Button variant="primary" onClick={addToCart} disabled={!orchid.available}>
                                Add to Cart
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Img
                            variant="top"
                            src={orchid.orchidUrl || 'https://via.placeholder.com/350'}
                            alt={orchid.orchidName || 'Orchid Image'}
                            height={350}
                            onError={(e) => {
                                console.log(`Image failed to load: ${orchid.orchidUrl}`);
                                e.target.src = 'https://via.placeholder.com/350';
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
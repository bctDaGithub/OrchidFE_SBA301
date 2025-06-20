import { useEffect, useState } from 'react';
import {
    Container,
    Button,
    Col,
    Row,
    Card,
    Form,
    InputGroup,
    Dropdown
} from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../style/Home.css';

export default function Home() {
    const baseUrl = 'http://localhost:8080/api/v1/query';
    const [api, setAPI] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterNatural, setFilterNatural] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('Fetching orchids from:', `${baseUrl}/orchid`);
            const response = await axios.get(`${baseUrl}/orchid`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const sortedData = response.data.sort((a, b) =>
                a.orchidName.localeCompare(b.orchidName)
            );
            setAPI(sortedData);
            console.log('Fetched orchids:', sortedData);
        } catch (error) {
            console.error('Error fetching orchid data:', error.response || error);
            setError('Failed to load orchids. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrchids = api.filter((item) => {
        const matchesSearch = item.orchidName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterNatural === 'all' ||
            (filterNatural === 'natural' && item.natural) || // Changed to item.natural to match API
            (filterNatural === 'industrial' && !item.natural);
        return matchesSearch && matchesFilter && item.available; // Only show available orchids
    });

    return (
        <Container className="home-container" style={{ minHeight: '100vh', padding: '20px' }}>
            <Row className="mb-4">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <i className="fas fa-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search by orchid name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={3}>
                    <Dropdown onSelect={(key) => setFilterNatural(key)}>
                        <Dropdown.Toggle variant="outline-secondary" id="dropdown-natural-filter">
                            Filter: {filterNatural === 'all' ? 'All' : filterNatural === 'natural' ? 'Natural' : 'Industrial'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="all">All</Dropdown.Item>
                            <Dropdown.Item eventKey="natural">Natural</Dropdown.Item>
                            <Dropdown.Item eventKey="industrial">Industrial</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>

            {isLoading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className="text-danger">{error}</div>
            ) : filteredOrchids.length === 0 ? (
                <div>No orchids found.</div>
            ) : (
                <Row>
                    {filteredOrchids.map((item) => (
                        <Col md={4} key={item.orchidId} className="mb-4">
                            <Card>
                                <Card.Img
                                    variant="top"
                                    src={item.orchidUrl || 'https://via.placeholder.com/350'}
                                    alt={item.orchidName || 'Orchid Image'}
                                    height={350}
                                    onError={(e) => {
                                        console.log(`Image failed to load: ${item.orchidUrl}`);
                                        e.target.src = 'https://via.placeholder.com/350';
                                    }}
                                />
                                <Card.Body>
                                    <Card.Title>{item.orchidName || 'N/A'}</Card.Title>
                                    <p className="text-muted mb-2">
                                        Price: {item.price ? item.price.toLocaleString('en-US') : 'N/A'} VND
                                    </p>
                                    <Link to={`/orchid/${item.orchidId}`}>
                                        <Button variant="primary">Detail</Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
}
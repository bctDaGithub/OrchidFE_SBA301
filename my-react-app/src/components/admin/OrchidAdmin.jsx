import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Image,
  Badge
} from 'react-bootstrap';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './style/OrchidAdmin.css';

export default function OrchidAdmin() {
  const queryUrl = 'http://localhost:8080/api/v1/query/orchid';
  const commandUrl = 'http://localhost:8080/api/v1/command/orchid';
  const accessToken = localStorage.getItem('accessToken');

  const [orchids, setOrchids] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      orchidName: '',
      orchidDescription: '',
      price: '',
      orchidUrl: '',
      isNatural: false
    }
  });
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate, user, isAdmin]);

  const fetchData = async () => {
    try {
      console.log('Fetching orchids from:', queryUrl);
      const response = await axios.get(queryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const sortedData = response.data.sort((a, b) => b.orchidId - a.orchidId);
      setOrchids(sortedData);
      console.log('Fetched orchids:', sortedData);
    } catch (error) {
      console.error('Error fetching orchids:', error.response || error);
      toast.error('Failed to fetch orchids.');
    }
  };

  const handleShowAdd = () => {
    setIsEditMode(false);
    reset();
    setShowModal(true);
  };

  const handleShowEdit = (orchid) => {
    setIsEditMode(true);
    setEditId(orchid.orchidId);
    setValue('orchidName', orchid.orchidName);
    setValue('orchidDescription', orchid.orchidDescription);
    setValue('price', orchid.price);
    setValue('orchidUrl', orchid.orchidUrl);
    setValue('isNatural', orchid.natural);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = async (data) => {
    const payload = {
      orchidName: data.orchidName,
      orchidDescription: data.orchidDescription,
      price: parseFloat(data.price),
      orchidUrl: data.orchidUrl,
      natural: data.isNatural,
      ...(isEditMode && { orchidId: editId }) // Only include orchidId for updates
    };

    try {
      const method = isEditMode ? 'put' : 'post';
      const url = isEditMode ? `${commandUrl}/update` : commandUrl; // Use base commandUrl for create
      console.log(`Submitting ${method} request to:`, url, 'with payload:', payload);
      const response = await axios[method](url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log(`${isEditMode ? 'Update' : 'Create'} response:`, response.data);
      toast.success(`Orchid ${isEditMode ? 'updated' : 'created'} successfully!`);
      await fetchData();
      handleClose();
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} failed:`, error.response || error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} orchid: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const toggleOrchidAvailability = async (orchid) => {
    const action = orchid.available ? 'disable' : 'enable';
    const confirm = window.confirm(`Are you sure you want to ${action} this orchid?`);
    if (!confirm) return;

    const url = `${commandUrl}/${action}`;
    const payload = { orchidId: orchid.orchidId };

    try {
      console.log(`Sending ${action} request to:`, url, 'with payload:', payload);
      const response = await axios.put(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log(`${action} response:`, response.data);
      toast.success(`Orchid ${action}d successfully`);
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action} orchid:`, error.response || error);
      toast.error(`Failed to ${action} orchid: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  return (
    <Container className="orchid-admin-container py-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">Admin Orchid Management</h1>
      <div className="mb-4 text-end">
        <Button variant="primary" onClick={handleShowAdd}>
          <i className="bi bi-plus-circle me-2"></i>Add New Orchid
        </Button>
      </div>
      <Table striped bordered hover responsive className="orchid-table shadow-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price (₫)</th>
            <th>Origin</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orchids.length > 0 ? (
            orchids.map((orchid) => (
              <tr key={orchid.orchidId}>
                <td className="align-middle">
                  <Image src={orchid.orchidUrl} width={100} rounded />
                </td>
                <td className="align-middle">{orchid.orchidName}</td>
                <td className="align-middle">{orchid.orchidDescription}</td>
                <td className="align-middle">{orchid.price.toLocaleString()} ₫</td>
                <td className="align-middle">
                  <Badge bg={orchid.natural ? 'success' : 'warning'}>
                    {orchid.natural ? 'Natural' : 'Industrial'}
                  </Badge>
                </td>
                <td className="align-middle">
                  <Badge bg={orchid.available ? 'success' : 'secondary'}>
                    {orchid.available ? 'Enabled' : 'Disabled'}
                  </Badge>
                </td>
                <td className="align-middle">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowEdit(orchid)}
                  >
                    <i className="bi bi-pencil-square me-1"></i>Edit
                  </Button>
                  <Button
                    variant={orchid.available ? 'outline-danger' : 'outline-success'}
                    size="sm"
                    onClick={() => toggleOrchidAvailability(orchid)}
                  >
                    <i className={`bi ${orchid.available ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i>
                    {orchid.available ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4">
                No orchids found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{isEditMode ? 'Edit Orchid' : 'Add Orchid'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Orchid Name</Form.Label>
              <Form.Control
                {...register('orchidName', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                placeholder="Enter orchid name"
              />
              {errors.orchidName && <small className="text-danger">{errors.orchidName.message}</small>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('orchidDescription', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                })}
                placeholder="Enter description"
              />
              {errors.orchidDescription && <small className="text-danger">{errors.orchidDescription.message}</small>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price (₫)</Form.Label>
              <Form.Control
                type="number"
                step="1000"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                placeholder="Enter price"
              />
              {errors.price && <small className="text-danger">{errors.price.message}</small>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                {...register('orchidUrl', {
                  required: 'Image URL is required',
                  pattern: {
                    value: /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i,
                    message: 'Enter a valid image URL'
                  }
                })}
                placeholder="https://example.com/image.jpg"
              />
              {errors.orchidUrl && <small className="text-danger">{errors.orchidUrl.message}</small>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Is Natural"
                {...register('isNatural')}
              />
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="primary">
                {isEditMode ? 'Update' : 'Add'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
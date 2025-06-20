import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Modal
} from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './style/UserAdmin.css';

export default function UserAdmin() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const accessToken = localStorage.getItem('accessToken');
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [navigate, user, isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/query/account', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Error loading users');
    }
  };

  const handleConfirmToggle = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const handleToggleBlock = async () => {
    const user = selectedUser;
    const url = user.available
      ? 'http://localhost:8080/api/v1/command/account/block'
      : 'http://localhost:8080/api/v1/command/account/unblock';

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id: user.id,
          userName: user.userName,
          email: user.email,
          currentPassword: '',
          newPassword: '',
          isAvailable: user.available
        })
      });

      if (!response.ok) throw new Error('Action failed');
      toast.success(user.available ? 'User blocked!' : 'User unblocked!');
      setShowConfirmModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Error updating user status');
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleRoleFilter = (e) => setRoleFilter(e.target.value);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role?.name === roleFilter.toUpperCase();
    return matchSearch && matchRole;
  });

  return (
    <Container className="user-admin-container py-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">Admin User Management</h1>
      <div className="mb-4 d-flex flex-column flex-sm-row gap-3 justify-content-between">
        <InputGroup className="w-100 w-sm-50">
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </InputGroup>
        <Form.Select
          className="w-100 w-sm-25"
          value={roleFilter}
          onChange={handleRoleFilter}
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="CUSTOMER">User</option>
        </Form.Select>
      </div>

      <Table striped bordered hover responsive className="user-table shadow-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.userName}</td>
                <td>
                  {user.role?.name === 'ADMIN' ? (
                    <Badge bg="success">Admin</Badge>
                  ) : (
                    <Badge bg="warning">User</Badge>
                  )}
                </td>
                <td>
                  {user.available ? (
                    <Badge bg="info">Active</Badge>
                  ) : (
                    <Badge bg="secondary">Blocked</Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant={user.available ? 'outline-danger' : 'outline-success'}
                    size="sm"
                    onClick={() => handleConfirmToggle(user)}
                  >
                    {user.available ? 'Block' : 'Unblock'}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal confirm */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to <strong>{selectedUser?.available ? 'block' : 'unblock'}</strong> user{' '}
          <strong>{selectedUser?.email}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant={selectedUser?.available ? 'danger' : 'success'}
            onClick={handleToggleBlock}
          >
            {selectedUser?.available ? 'Block' : 'Unblock'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

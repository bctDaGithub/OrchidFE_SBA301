import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Modal, Form, Col, Row } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../style/MyProfile.css';

export default function MyProfile() {
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm();
  const user = JSON.parse(localStorage.getItem('user'));

 useEffect(() => {
  if (!user || !user.userId) {
    toast.error('Please log in to view your profile.');
    navigate('/login');
    return;
  }

  const accessToken = localStorage.getItem('accessToken');

  fetch(`http://localhost:8080/api/v1/query/account/${user.userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      return res.json();
    })
    .then((data) => {
      setUserData({
        email: data.email,
        fullName: data.userName,
        role: data.role?.name || 'user',
      });
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      toast.error('Error fetching user data.');
    });
}, [navigate]);



  const handleShowEdit = () => {
    if (userData) {
      setValue('fullName', userData.fullName);
      setShowModal(true);
    } else {
      toast.error('No user data available to edit.');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = async (data) => {
  const accessToken = localStorage.getItem('accessToken');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!storedUser || !storedUser.userId || !accessToken) {
    toast.error('Authentication error. Please login again.');
    navigate('/login');
    return;
  }

  try {
    // Kiểm tra xác thực mật khẩu cũ (bắt buộc nếu đổi mật khẩu)
    if (data.oldPassword && data.oldPassword !== userData.password) {
      toast.error('Old password is incorrect.');
      return;
    }

    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    const updatePayload = {
      id: storedUser.userId,
      userName: data.fullName,
      email: userData.email,
      currentPassword: data.oldPassword || userData.password,
      newPassword: data.newPassword || '',
      isAvailable: true,
    };

    const res = await fetch('http://localhost:8080/api/v1/command/account', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updatePayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to update profile');
    }

    const updatedData = {
      email: userData.email,
      fullName: data.fullName,
      role: userData.role,
    };
    setUserData(updatedData);

    localStorage.setItem('user', JSON.stringify({
      ...storedUser,
      // Cập nhật tên mới (nếu bạn dùng sau này trong UI)
      fullName: data.fullName
    }));

    toast.success('Profile updated successfully!');
    handleClose();
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile.');
  }
};


  return (
    <Container className="my-profile-container py-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">My Profile</h1>
      {userData ? (
        <Card className="profile-card shadow-sm">
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Full Name:</strong> {userData.fullName}</p>
                <p><strong>Role:</strong> {userData.role}</p>
              </Col>
              <Col md={6} className="text-right">
                <Button
                  variant="primary"
                  onClick={handleShowEdit}
                  className="edit-button"
                >
                  <i className="bi bi-pencil-square me-2"></i>Edit Profile
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        <p className="text-center text-danger mt-4">Loading user data...</p>
      )}

      <Modal show={showModal} onHide={handleClose} backdrop="static" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="font-semibold">Email (Cannot Edit)</Form.Label>
              <Form.Control
                type="email"
                value={userData?.email || ''}
                disabled
                className="border-gray-300"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="fullName">
              <Form.Label className="font-semibold">Full Name</Form.Label>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    type="text"
                    placeholder="Enter full name"
                    className="border-gray-300 focus:ring-blue-500"
                    autoFocus
                  />
                )}
              />
              {errors.fullName && (
                <p className="text-danger mt-1">{errors.fullName.message}</p>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="oldPassword">
              <Form.Label className="font-semibold">Old Password</Form.Label>
              <Form.Control
                type="password"
                {...register('oldPassword')}
                placeholder="Enter old password (required if changing password)"
                className="border-gray-300 focus:ring-blue-500"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label className="font-semibold">New Password</Form.Label>
              <Controller
                name="newPassword"
                control={control}
                rules={{
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                }}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    type="password"
                    placeholder="Enter new password (optional)"
                    className="border-gray-300 focus:ring-blue-500"
                  />
                )}
              />
              {errors.newPassword && (
                <p className="text-danger mt-1">{errors.newPassword.message}</p>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label className="font-semibold">Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirm new password"
                className="border-gray-300 focus:ring-blue-500"
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose} className="cancel-button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" onClick={onSubmit} className="save-button">
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

import React, { useState } from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBIcon,
  MDBCheckbox
} from 'mdb-react-ui-kit';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '../style/LoginForm.css';
import { useNavigate } from 'react-router-dom';

// Hàm giải mã JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return null;
  }
}

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/query/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      const decoded = parseJwt(data.accessToken);
      if (!decoded) throw new Error('Invalid token');

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      }));

      setError('');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/command/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: fullName,
          email,
          currentPassword: password,
          newPassword: '',
          isAvailable: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register. Email may already exist.');
      }

      localStorage.setItem('user', JSON.stringify({ email, role: 'user' }));
      setError('');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPasswordSubmit = () => {
    setError('Reset link sent to your email (simulated).');
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
  };

  const renderLoginForm = () => (
    <>
      <h2 className="form-title">Sign in</h2>
      <p className="form-subtitle">Please enter your login and password!</p>
      {error && <p className="text-danger">{error}</p>}

      <MDBInput
        wrapperClass='mb-4 text-start'
        label='Email address'
        id='email'
        type='email'
        size="lg"
        autoComplete="new-password"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        labelClass='text-dark fw-bold'
        inputClass='text-dark'
      />
      <MDBInput
        wrapperClass='mb-4 text-start'
        label='Password'
        id='password'
        type='password'
        size="lg"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        labelClass='text-dark fw-bold'
        inputClass='text-dark'
      />

      <div className="d-flex justify-content-between mb-4">
        <MDBCheckbox name='flexCheck' id='flexCheckDefault' label='Remember password' />
        <a className="form-link" onClick={() => setIsForgotPassword(true)}>Forgot password?</a>
      </div>

      <MDBBtn size='lg' className='w-100 mb-4' onClick={handleLogin}>
        Login
      </MDBBtn>

      <hr className="my-4" />

      <MDBBtn className="mb-4 w-100" size="lg" style={{ backgroundColor: '#dd4b39' }} disabled>
        <MDBIcon fab icon="google" className="mx-2" />
        Sign in with Google (Disabled)
      </MDBBtn>

      <div className="toggle-form">
        <p>Don't have an account? <a className="form-link" onClick={toggleForm}>Register</a></p>
      </div>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <h2 className="form-title">Create Account</h2>
      <p className="form-subtitle">Please fill in your details!</p>
      {error && <p className="text-danger">{error}</p>}

      <MDBInput
        wrapperClass='mb-4 text-start'
        label='Full Name'
        id='name'
        type='text'
        size="lg"
        autoComplete="new-password"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        labelClass='text-dark fw-bold'
        inputClass='text-dark'
      />
      <MDBInput
        wrapperClass='mb-4 text-start'
        label='Email address'
        id='email'
        type='email'
        size="lg"
        autoComplete="new-password"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        labelClass='text-dark fw-bold'
        inputClass='text-dark'
      />
      <MDBInput
        wrapperClass='mb-4 text-start'
        label='Password'
        id='password'
        type='password'
        size="lg"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        labelClass='text-dark fw-bold'
        inputClass='text-dark'
      />
      <MDBInput
        wrapperClass='mb-4 text-start'
        label='Confirm Password'
        id='confirmPassword'
        type='password'
        size="lg"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        labelClass='text-dark fw-bold'
        inputClass='text-dark'
      />

      <div className="password-requirements">
        Password must contain at least 8 characters, including uppercase, lowercase, numbers and special characters
      </div>

      <MDBBtn size='lg' className='w-100 mb-4 mt-4' onClick={handleRegister}>
        Register
      </MDBBtn>

      <div className="toggle-form">
        <p>Already have an account? <a className="form-link" onClick={toggleForm}>Login</a></p>
      </div>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <h2 className="form-title">Reset Password</h2>
      <p className="form-subtitle">Enter your email to reset your password</p>
      {error && <p className="text-danger">{error}</p>}

      <MDBInput
        wrapperClass='mb-4 text-start'
        label='Email address'
        id='email'
        type='email'
        size="lg"
        autoComplete="new-password"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        labelClass='text-dark fw-bold'
        inputClass='text-dark'
      />

      <MDBBtn size='lg' className='w-100 mb-4' onClick={handleForgotPasswordSubmit}>
        Send Reset Link
      </MDBBtn>

      <div className="toggle-form">
        <p>Remember your password? <a className="form-link" onClick={() => setIsForgotPassword(false)}>Back to Login</a></p>
      </div>
    </>
  );

  return (
    <div className="login-container">
      <MDBContainer>
        <MDBRow className='d-flex justify-content-center align-items-center'>
          <MDBCol col='12'>
            <MDBCard className='bg-white my-5 mx-auto form-container' style={{ borderRadius: '1rem' }}>
              <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                {isForgotPassword ? renderForgotPasswordForm() : (isLogin ? renderLoginForm() : renderRegisterForm())}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default LoginForm;

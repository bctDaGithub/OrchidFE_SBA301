import React, { useState, useEffect } from 'react';
import {
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBNavbarToggler,
  MDBContainer,
  MDBIcon,
  MDBBtn,
  MDBCollapse
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import '../style/NavBar.css';

const NavBar = () => {
  const [showNav, setShowNav] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'ADMIN';

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalQuantity);
      console.log('Cart count updated:', totalQuantity);
    } catch (err) {
      console.error('Error loading cart count:', err);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowNav(false);
  };

  return (
    <MDBNavbar expand="lg" light bgColor="light" className="navbar">
      <MDBContainer fluid>
        <MDBNavbarBrand onClick={() => handleNavigation('/')} className="brand" style={{ cursor: 'pointer' }}>
          <MDBIcon fas icon="leaf" className="brand-icon" />
          Spring Orchid
        </MDBNavbarBrand>

        <MDBNavbarToggler
          type="button"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={() => setShowNav(!showNav)}
        >
          <MDBIcon icon="bars" fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar show={showNav}>
          <div className="d-flex w-100 justify-content-end align-items-center flex-wrap flex-lg-nowrap ms-auto">
            <MDBNavbarNav className="flex-row align-items-center gap-3 navbar-nav-right">
              <MDBNavbarItem>
                <MDBNavbarLink onClick={() => handleNavigation('/')} style={{ cursor: 'pointer' }}>
                  <MDBIcon fas icon="home" className="me-2" />
                  Home
                </MDBNavbarLink>
              </MDBNavbarItem>
              {user && isAdmin && (
                <>
                  <MDBNavbarItem>
                    <MDBNavbarLink onClick={() => handleNavigation('/admin/users')} style={{ cursor: 'pointer' }}>
                      <MDBIcon fas icon="users" className="me-2" />
                      Users
                    </MDBNavbarLink>
                  </MDBNavbarItem>
                  <MDBNavbarItem>
                    <MDBNavbarLink onClick={() => handleNavigation('/admin/orchids')} style={{ cursor: 'pointer' }}>
                      <MDBIcon fas icon="spa" className="me-2" />
                      Orchids
                    </MDBNavbarLink>
                  </MDBNavbarItem>
                  <MDBNavbarItem>
                    <MDBNavbarLink onClick={() => handleNavigation('/admin/orders')} style={{ cursor: 'pointer' }}>
                      <MDBIcon fas icon="list-alt" className="me-2" />
                      Orders
                    </MDBNavbarLink>
                  </MDBNavbarItem>
                </>
              )}
              {user && (
                <>
                  <MDBNavbarItem>
                    <MDBNavbarLink onClick={() => handleNavigation('/my-account')} style={{ cursor: 'pointer' }}>
                      <MDBIcon fas icon="user-circle" className="me-2" />
                      My Account
                    </MDBNavbarLink>
                  </MDBNavbarItem>
                  {!isAdmin && (
                    <MDBNavbarItem>
                      <MDBNavbarLink onClick={() => handleNavigation('/order-tracking')} style={{ cursor: 'pointer' }}>
                        <MDBIcon fas icon="truck" className="me-2" />
                        Order Tracking
                      </MDBNavbarLink>
                    </MDBNavbarItem>
                  )}
                </>
              )}
            </MDBNavbarNav>

            <div className="d-flex align-items-center gap-3 ms-3 right-actions">
              <MDBBtn
                color="link"
                rippleColor="dark"
                className="text-reset m-0 cart-icon"
                onClick={() => handleNavigation('/cart')}
              >
                <MDBIcon fas icon="shopping-cart" />
                {cartCount > 0 && (
                  <span className="badge rounded-pill badge-notification bg-danger">
                    {cartCount}
                  </span>
                )}
              </MDBBtn>

              {user ? (
                <MDBBtn
                  color="primary"
                  className="d-flex align-items-center"
                  onClick={handleLogout}
                >
                  <MDBIcon fas icon="sign-out-alt" className="me-2" />
                  Log out
                </MDBBtn>
              ) : (
                <MDBBtn
                  color="primary"
                  className="d-flex align-items-center"
                  onClick={() => handleNavigation('/login')}
                >
                  <MDBIcon fas icon="sign-in-alt" className="me-2" />
                  Login
                </MDBBtn>
              )}
            </div>
          </div>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
};

export default NavBar;
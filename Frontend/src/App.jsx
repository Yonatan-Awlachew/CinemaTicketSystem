import React, { useState } from 'react';
import './App.css';

import { useAuth } from './context/AuthContext';

import Login from './components/Login';
import Register from './components/Register';
import ScreeningsList from './components/ScreeningsList';
import Profile from './components/Profile';
import AdminUserList from './components/AdminUserList';
import AdminCreateScreening from './components/AdminCreateScreening';

function App() {
  const { user, logout, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a
            className="navbar-brand"
            href="#"
            onClick={() => setCurrentView('home')}
          >
            🎬 Cinema Tickets
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* Home */}
              <li className="nav-item">
                <a
                  className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                  href="#"
                  onClick={() => setCurrentView('home')}
                >
                  Home
                </a>
              </li>

              {/* Screenings */}
              <li className="nav-item">
                <a
                  className={`nav-link ${currentView === 'screenings' ? 'active' : ''}`}
                  href="#"
                  onClick={() => setCurrentView('screenings')}
                >
                  Screenings
                </a>
              </li>

              {/* Authenticated */}
              {user ? (
                <>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
                      href="#"
                      onClick={() => setCurrentView('profile')}
                    >
                      👤 Profile
                    </a>
                  </li>

                  {user.role === 'Administrator' && (
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          currentView === 'admin-users' ? 'active' : ''
                        }`}
                        href="#"
                        onClick={() => setCurrentView('admin-users')}
                      >
                        👥 Manage Users
                      </a>
                    </li>
                  )}

                  <li className="nav-item">
                    <span className="nav-link text-light">
                      {user.firstName} {user.lastName}
                      {user.role === 'Administrator' && (
                        <span className="badge bg-danger ms-2">Admin</span>
                      )}
                    </span>
                  </li>

                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link"
                      onClick={() => {
                        logout();
                        setCurrentView('home');
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {/* Login */}
                  <li className="nav-item">
                    <a
                      className={`nav-link ${currentView === 'login' ? 'active' : ''}`}
                      href="#"
                      onClick={() => setCurrentView('login')}
                    >
                      Login
                    </a>
                  </li>

                  {/* Register */}
                  <li className="nav-item">
                    <a
                      className={`nav-link ${currentView === 'register' ? 'active' : ''}`}
                      href="#"
                      onClick={() => setCurrentView('register')}
                    >
                      Register
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <main>
        {currentView === 'home' && (
          <div className="container mt-5">
            <div className="hero-section text-center p-5 bg-light rounded">
              <h1 className="display-4 mb-3">Welcome to Cinema Tickets</h1>
              <p className="lead text-muted mb-4">
                Your premier destination for movie ticket booking
              </p>

              {user ? (
                <>
                  <p className="mb-4">
                    Hello, {user.firstName}! Ready to book some tickets?
                  </p>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setCurrentView('screenings')}
                  >
                    Browse Screenings
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-4">Sign in to start booking tickets!</p>
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => setCurrentView('login')}
                    >
                      Login
                    </button>
                    <button
                      className="btn btn-warning btn-lg"  
                      onClick={() => setCurrentView('register')}
                    >
                      Register
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {currentView === 'screenings' && (
          <ScreeningsList onNavigate={setCurrentView} />
        )}

        {currentView === 'profile' && user && <Profile />}

        {currentView === 'admin-users' &&
          user?.role === 'Administrator' && <AdminUserList />}

        {currentView === 'login' && (
          <Login onSwitchToRegister={() => setCurrentView('register')} />
        )}

        {currentView === 'create-screening' && user?.role === 'Administrator' && (
          <AdminCreateScreening onBack={() => setCurrentView('screenings')} />
        )}
        
        {currentView === 'register' && (
          <Register onSwitchToLogin={() => setCurrentView('login')} />
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <div className="container">
          <p className="mb-0">© 2025 Cinema Tickets. All rights reserved.</p>
          <small className="text-muted">
            JWT Auth + MySQL + React + Concurrency Control
          </small>
        </div>
      </footer>
    </div>
  );
}

export default App;
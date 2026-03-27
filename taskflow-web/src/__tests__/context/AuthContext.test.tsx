import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks';
import { authApi } from '@/lib/api';
import { getToken, saveToken, removeToken } from '@/lib/auth';

// Mock API and Auth helpers
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  getToken: jest.fn(),
  saveToken: jest.fn(),
  removeToken: jest.fn(),
}));

// Test component to consume the hook
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <button onClick={() => login('test@test.com', 'pass')}>Login</button>;
  return (
    <div>
      <span>User: {user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('Integración de AuthContext', () => {
  const mockUser = { 
    id: 1, 
    name: 'Test User', 
    email: 'test@test.com',
    role: 'admin',
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restaura la sesión si el token existe', async () => {
    (getToken as jest.Mock).mockReturnValue('valid-token');
    (authApi.getMe as jest.Mock).mockResolvedValue(mockUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(authApi.getMe).toHaveBeenCalled();
    expect(screen.getByText('User: Test User')).toBeInTheDocument();
  });

  it('muestra el botón de login si no existe token', async () => {
    (getToken as jest.Mock).mockReturnValue(null);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('realiza el inicio de sesión correctamente', async () => {
    (getToken as jest.Mock).mockReturnValue(null);
    (authApi.login as jest.Mock).mockResolvedValue({
      token: 'new-token',
      user: mockUser
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pass'
    });
    expect(saveToken).toHaveBeenCalledWith('new-token');
    expect(screen.getByText('User: Test User')).toBeInTheDocument();
  });

  it('limpia la sesión al cerrar sesión', async () => {
    (getToken as jest.Mock).mockReturnValue('valid-token');
    (authApi.getMe as jest.Mock).mockResolvedValue(mockUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      logoutButton.click();
    });

    expect(removeToken).toHaveBeenCalled();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});

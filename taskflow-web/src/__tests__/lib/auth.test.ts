import { saveToken, getToken, removeToken, getAuthHeaders } from '@/lib/auth';

const TOKEN_KEY = 'taskflow-token';

describe('Helpers de autenticación (auth.ts)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveToken', () => {
    it('almacena el token en sessionStorage', () => {
      saveToken('mi-token-de-prueba');
      expect(sessionStorage.getItem(TOKEN_KEY)).toBe('mi-token-de-prueba');
    });
  });

  describe('getToken', () => {
    it('devuelve null si no hay token almacenado', () => {
      expect(getToken()).toBeNull();
    });

    it('devuelve el token almacenado correctamente', () => {
      sessionStorage.setItem(TOKEN_KEY, 'token-existente');
      expect(getToken()).toBe('token-existente');
    });
  });

  describe('removeToken', () => {
    it('elimina el token de sessionStorage', () => {
      sessionStorage.setItem(TOKEN_KEY, 'token-a-eliminar');
      removeToken();
      expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  describe('getAuthHeaders', () => {
    it('devuelve cabecera Authorization si hay token', () => {
      sessionStorage.setItem(TOKEN_KEY, 'mi-jwt');
      const headers = getAuthHeaders();
      expect(headers).toEqual({ Authorization: 'Bearer mi-jwt' });
    });

    it('devuelve objeto vacío si no hay token', () => {
      const headers = getAuthHeaders();
      expect(headers).toEqual({});
    });
  });
});

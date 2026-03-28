import axios from 'axios';
import { tasksApi, projectsApi } from '@/lib/api';

// Mockeamos axios para interceptar las llamadas sin hacer peticiones reales
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn().mockReturnThis(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  };
  return mockAxios;
});

// Mockeamos el helper de auth para evitar acceso a sessionStorage
jest.mock('@/lib/auth', () => ({
  getToken: jest.fn().mockReturnValue(null),
  saveToken: jest.fn(),
  removeToken: jest.fn(),
  getAuthHeaders: jest.fn().mockReturnValue({}),
}));

const mockApi = axios as jest.Mocked<typeof axios>;

describe('Contratos HTTP de tasksApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('archive usa el método PATCH', async () => {
    await tasksApi.archive(1);
    expect(mockApi.patch).toHaveBeenCalledWith('/tasks/1/archive');
  });

  it('unarchive usa el método PATCH', async () => {
    await tasksApi.unarchive(1);
    expect(mockApi.patch).toHaveBeenCalledWith('/tasks/1/unarchive');
  });

  it('restore usa el método PATCH', async () => {
    await tasksApi.restore(1);
    expect(mockApi.patch).toHaveBeenCalledWith('/tasks/1/restore');
  });

  it('delete usa el método DELETE (borrado lógico)', async () => {
    await tasksApi.delete(1);
    expect(mockApi.delete).toHaveBeenCalledWith('/tasks/1');
  });

  it('permanentDelete usa el método DELETE a la ruta /permanent', async () => {
    await tasksApi.permanentDelete(1);
    expect(mockApi.delete).toHaveBeenCalledWith('/tasks/1/permanent');
  });
});

describe('Contratos HTTP de projectsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('archive usa el método POST', async () => {
    await projectsApi.archive(1);
    expect(mockApi.post).toHaveBeenCalledWith('/projects/1/archive');
  });

  it('delete usa el método DELETE (borrado lógico hacia papelera)', async () => {
    await projectsApi.delete(1);
    expect(mockApi.delete).toHaveBeenCalledWith('/projects/1');
  });

  it('permanentDelete usa el método DELETE a la ruta /permanent', async () => {
    await projectsApi.permanentDelete(1);
    expect(mockApi.delete).toHaveBeenCalledWith('/projects/1/permanent');
  });
});

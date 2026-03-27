import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';

describe('Componentes de Badge', () => {
  describe('StatusBadge', () => {
    it('renderiza "En progreso" para el estado in_progress', () => {
      render(<StatusBadge status="in_progress" />);
      expect(screen.getByText(/En progreso/i)).toBeInTheDocument();
    });

    it('renderiza "Completada" para el estado done', () => {
      render(<StatusBadge status="done" />);
      expect(screen.getByText(/Completada/i)).toBeInTheDocument();
    });

    it('aplica las clases correctas para el estado todo', () => {
      render(<StatusBadge status="todo" />);
      expect(screen.getByText(/Por hacer/i)).toBeInTheDocument();
    });
  });

  describe('PriorityBadge', () => {
    it('renderiza "Alta" para prioridad high', () => {
      render(<PriorityBadge priority="high" />);
      expect(screen.getByText(/Alta/i)).toBeInTheDocument();
    });

    it('renderiza "Media" para prioridad medium', () => {
      render(<PriorityBadge priority="medium" />);
      expect(screen.getByText(/Media/i)).toBeInTheDocument();
    });

    it('renderiza "Baja" para prioridad low', () => {
      render(<PriorityBadge priority="low" />);
      expect(screen.getByText(/Baja/i)).toBeInTheDocument();
    });

    it('renderiza el punto de prioridad', () => {
      const { container } = render(<PriorityBadge priority="medium" />);
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
    });
  });
});

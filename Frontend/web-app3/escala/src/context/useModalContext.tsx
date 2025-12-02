import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

type ModalContent = ReactNode | null;

type ModalContextValue = {
  isOpen: boolean;
  content: ModalContent;
  openModal: (nextContent?: ReactNode) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

type ModalProviderProps = {
  children: ReactNode;
};

export function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ModalContent>(null);

  const openModal = useCallback((nextContent?: ReactNode) => {
    setContent(nextContent ?? null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setContent(null);
  }, []);

  const value = useMemo<ModalContextValue>(
    () => ({
      isOpen,
      content,
      openModal,
      closeModal,
    }),
    [isOpen, content, openModal, closeModal]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }

  return context;
}

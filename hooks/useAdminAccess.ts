import { useEffect, useState } from 'react';

/**
 * Hook personalizado para detectar intentos de acceso administrativo
 * 
 * Detecta:
 * 1. Combinación de teclas: Ctrl+Shift+A (Windows/Linux) o Cmd+Shift+A (Mac)
 * 2. Parámetro URL: ?admin=true
 * 3. Ruta oculta: /admin-access
 * 
 * Uso:
 * const { showAdminModal, openAdminModal, closeAdminModal } = useAdminAccess();
 */
export const useAdminAccess = () => {
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    // 1. Detectar combinación de teclas: Ctrl+Shift+A o Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifierKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        console.log('🔑 Combinación de teclas admin detectada');
        setShowAdminModal(true);
      }
    };

    // 2. Detectar parámetro URL: ?admin=true
    const checkURLParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        console.log('🔗 Parámetro URL admin detectado');
        setShowAdminModal(true);
        // Limpiar URL sin recargar la página
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // 3. Detectar ruta oculta: /admin-access
    const checkHiddenRoute = () => {
      if (window.location.pathname === '/admin-access') {
        console.log('🚪 Ruta admin detectada');
        setShowAdminModal(true);
        // Cambiar a home sin recargar
        window.history.replaceState({}, document.title, '/');
      }
    };

    // Ejecutar verificaciones
    checkURLParams();
    checkHiddenRoute();
    
    // Agregar listener de teclado
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openAdminModal = () => {
    console.log('🔓 Abriendo modal de acceso admin');
    setShowAdminModal(true);
  };

  const closeAdminModal = () => {
    console.log('🔒 Cerrando modal de acceso admin');
    setShowAdminModal(false);
  };

  return {
    showAdminModal,
    openAdminModal,
    closeAdminModal,
  };
};

/**
 * Hook para detectar triple-click en un elemento
 * Útil para activar acceso admin al hacer triple-click en el logo
 * 
 * Uso:
 * const handleTripleClick = useTripleClick(() => {
 *   openAdminModal();
 * });
 * 
 * <Logo onClick={handleTripleClick} />
 */
export const useTripleClick = (callback: () => void, delay: number = 500) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleClick = () => {
    const currentTime = Date.now();
    
    // Si pasó mucho tiempo desde el último click, reiniciar contador
    if (currentTime - lastClickTime > delay) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(currentTime);

    // Si llegamos a 3 clicks
    if (clickCount === 2 && currentTime - lastClickTime <= delay) {
      console.log('🖱️ Triple-click detectado');
      callback();
      setClickCount(0);
    }
  };

  return handleClick;
};

export default useAdminAccess;
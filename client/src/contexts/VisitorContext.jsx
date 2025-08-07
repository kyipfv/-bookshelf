import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const VisitorContext = createContext();

export function VisitorProvider({ children }) {
  const [visitorId, setVisitorId] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem('visitorId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('visitorId', id);
    }
    setVisitorId(id);
  }, []);

  return (
    <VisitorContext.Provider value={{ visitorId }}>
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error('useVisitor must be used within VisitorProvider');
  }
  return context;
}
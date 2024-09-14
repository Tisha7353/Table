// src/App.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import ArtTable from './components/ArtTable';

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Artworks</h1>
        <ArtTable />
      </div>
    </QueryClientProvider>
  );
};

export default App;

import React from 'react';
import { MantineProvider } from '@mantine/core';
import './App.css';
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { Home, NoPage, SnapAR, VRB } from "./pages";
import { DetailView } from './components';
import { MainLayout } from './layout/main';

const App = () => {
  return (
    <MantineProvider theme={{ primaryColor: 'dark' }}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route exact path="/view/:id" element={<MainLayout><Home /></MainLayout>} />
          <Route exact path="/snapar/:lensID" element={<MainLayout><SnapAR /></MainLayout>} />
          <Route exact path="/more/:id" element={<MainLayout><DetailView /></MainLayout>} />
          <Route exact path="/vr" element={<VRB />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App
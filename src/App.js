import React from 'react';
import { MantineProvider } from '@mantine/core';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, NoPage, Snap, SnapAR, Vr } from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <MantineProvider theme={{ primaryColor: 'dark' }}>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/vr" element={<Vr />} />
          <Route exact path="/snap" element={<Snap />} />
          <Route exact path="/snapar/:lensID" element={<SnapAR />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App
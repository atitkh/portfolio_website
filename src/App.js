import React from 'react';
import { MantineProvider } from '@mantine/core';
import './App.css';
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { Home, NoPage, SnapAR, Vr } from "./pages";

const App = () => {
  return (
    <MantineProvider theme={{ primaryColor: 'dark' }}>
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/vr" element={<Vr />} />
        <Route exact path="/snapar/:lensID" element={<SnapAR />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
    <HashRouter>
      <Routes>
        <Route exact path="/view/:id" element={<Home />} />
      </Routes>
    </HashRouter>
  </MantineProvider>
  );
}

export default App
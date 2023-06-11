import React from 'react';
import { MantineProvider } from '@mantine/core';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, NoPage } from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <MantineProvider theme={{ primaryColor: 'dark' }}>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App
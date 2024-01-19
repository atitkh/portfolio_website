import React from "react";
import ReactDom from "react-dom/client";
import { SkeletonTheme } from 'react-loading-skeleton'

import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

ReactDom.createRoot(rootElement).render(
    <SkeletonTheme>
        <App />
    </SkeletonTheme>
);

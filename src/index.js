import React from "react";
import ReactDom from "react-dom";
import { SkeletonTheme } from 'react-loading-skeleton'

import App from "./App";
import "./index.css";

ReactDom.render(<SkeletonTheme><App /></SkeletonTheme>, document.getElementById("root"));
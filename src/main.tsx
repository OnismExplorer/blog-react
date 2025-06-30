import React from "react";
import {createRoot} from "react-dom/client";
import 'antd/dist/reset.css';
import '@assets/css/index.css';
import '@utils/title.ts';
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

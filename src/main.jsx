import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './main.css'
import 'aos/dist/aos.css'
import AOS from 'aos'
import { BrowserRouter } from "react-router-dom";
import { applySitePreferences, loadSitePreferences } from './utils/sitePreferences';

applySitePreferences(loadSitePreferences());

AOS.init({
  duration: 600,
  offset: 80,
  once: true,
  easing: 'ease-out-cubic',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
)

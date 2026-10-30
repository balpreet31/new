import React from 'react';
import {createRoot,hydrateRoot} from 'react-dom/client';
import App from './App.jsx';
import routes from './data/routes.json';
import './styles.css';
import './enhancements.css';
import './finishing.css';
const root=document.getElementById('root');
const route=location.pathname==='/index.html'?'/':location.pathname;
const embedded=document.getElementById('page-data');
async function boot(){
 let pageData=embedded?JSON.parse(embedded.textContent):null;
 if(!embedded&&routes.includes(route)){
  try{const response=await fetch(`/content/pages/${route==='/'?'home':route.slice(1).replace('.html','')}.json`);if(response.ok)pageData=await response.json()}catch{}
 }
 const app=<App path={location.pathname} pageData={pageData}/>;
 if(root.hasChildNodes())hydrateRoot(root,app);else createRoot(root).render(app);
}
boot();

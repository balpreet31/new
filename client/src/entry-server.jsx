import {renderToString} from 'react-dom/server';
import App from './App.jsx';
import pages from './data/pages.json';
export const render=path=>renderToString(<App path={path} pageData={pages[path==='/index.html'?'/':path]||null}/>);

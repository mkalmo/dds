import React from 'react'
import ReactDOM from 'react-dom'
// @ts-ignore
import App from './comp/App.tsx';

const a: string = 'hello';

console.log(a);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

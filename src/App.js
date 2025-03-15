import './App.css';
import { useState } from 'react';

function App() {
const [value, setValue] = useState(0);
  
  return (
    <div>
      <h1>{value}</h1>
      <button onClick={() => setValue(value + 1)}>+</button>
      <button onClick={() => setValue(value - 1)}>-</button>
    </div>
  );
}

export default App;

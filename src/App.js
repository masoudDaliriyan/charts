import React, { useEffect, useState } from 'react';
import './App.css';
import Chart from './components/Chart';

function App()
{
  const [charts, setCharts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() =>
  {
    async function load()
    {
      try
      {
        const res = await fetch(process.env.PUBLIC_URL + '/data.json');
        if (!res.ok) throw new Error(`Failed to load data.json: ${ res.status }`);
        const json = await res.json();
        if (!Array.isArray(json)) throw new Error('Invalid data.json format: expected array');
        setCharts(json);
      } catch (e)
      {
        setError(e.message);
      }
    }
    load();
  }, []);

  return (
    <div className="App" style={ { padding: 20 } }>
      { error && <div style={ { color: 'red', marginBottom: 12 } }>Error: { error }</div> }
      { charts.map((c, idx) => (
        <Chart
          key={ idx }
          title={ c.title || `Chart ${ idx + 1 }` }
          data={ Array.isArray(c.data) ? c.data : [] }
          width={ (idx === 0 || idx === 1) ? 1600 : 700 }
        />
      )) }
    </div>
  );
}

export default App;

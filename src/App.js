import React from 'react';
import './App.css';
import Chart from './components/Chart';
import chartData from './data.json';

function App()
{
  return (
    <div className="App" style={ { padding: 20 } }>
      { chartData.map((chart, index) =>
      {
        const title = chart.title || `Chart ${ index + 1 }`;
        const data = Array.isArray(chart.data) ? chart.data : [];
        const width = (index === 0 || index === 1) ? 1600 : 700;

        return (
          <Chart
            key={ index }
            title={ title }
            data={ data }
            width={ width }
          />
        );
      }) }
    </div>
  );
}

export default App;

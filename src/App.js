// import { Client } from 'paho-mqtt';
import { connect, MqttClient } from 'mqtt'
import React, { useState } from 'react';
import Select from 'react-select';
import './App.css';
import ChartViewer from "./ChartViewer";



function App() {
  
  
  const options = [
    { value: 'aq1', label: 'Tiva 1' },
    { value: 'aq2', label: 'Tiva 2' },
    { value: 'aq3', label: 'Tiva 3' },
    { value: 'aq4', label: 'Tiva 4' },
    { value: 'aq5', label: 'Tiva 5' }
  ];
  const [selectedOption, setSelectedOption] = useState(null);


  
 
  // const client = connect('wss://broker.emqx.io:8084/mqtt');
  // client.end();


  function Disconnect() {
    // client.end();
    updateDataSetOne([0, 0, 0, 0, 0, 0]);
    updateDataSetTwo([0, 0, 0, 0, 0, 0]);
    setIncomingMessage(null);
    console.clear();
  }


  const [dataSetOne, updateDataSetOne] = useState([0, 0, 0, 0, 0, 0]);
  const [dataSetTwo, updateDataSetTwo] = useState([0, 0, 0, 0, 0, 0]);
  const [batteryLevel, updatebatteryLevel] = useState(95);
  const [temperatura, updatetemperatura] =useState([0, 0, 0, 0, 0, 0]);
  const [umidade, updateumidade] = useState([0, 0, 0, 0, 0, 0]);
  const [topicGeral, updateTopic] = useState('mqtt/ufpb-aq1/temp');

  const [incomingMessage, setIncomingMessage] = useState(null);
  const messageColor = incomingMessage != null ? 'green' : 'red';
  const batteryColor = batteryLevel <= 90 ? 'red' : 'green';
  const currentDate = new Date();
// aaaaaaaaaaaaa
  
  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const previa='mqtt/ufpb-'+selectedOption.value+'/temp';
    console.log("=---------------");
    console.log(topicGeral);
    updateTopic(previa);
    console.log(topicGeral);
    console.log("=---------------");

  }

  // console.clear();
  // add side effect to component
  React.useEffect(() => {
    // create interval
    const interval = setInterval(
      // set number every 5s
      () => {
       
        const client = connect('wss://broker.emqx.io:8084/mqtt');
        client.on('connect', () => {
          console.log('Connected to MQTT broker ' + topicGeral);
          client.subscribe(topicGeral, { qos: 1 });
        });
        // '{"Bateria":90, "Temperatura":42, "Umidade":60}'
        client.on('message', (topic2, message) => {
          const mensagem = JSON.parse(message.toString());
          
          setIncomingMessage(message.toString());
          updatebatteryLevel(parseFloat(mensagem.Bateria));
          // const val1 = Math.floor(mensagem.Temperatura * (50 - 0 + 1)) + 0;
          const val1 = Math.floor(mensagem.Temperatura);
          updateDataSetOne(prevData => {
            if(prevData.length >= 20) prevData.shift();
            // console.log(prevData);
            return ([...prevData, val1]);
          });
  
          // const val2 = Math.floor(mensagem.Umidade * (90 - 20 + 1)) + 20;
          const val2 = Math.floor(mensagem.Umidade );
          updateDataSetTwo(prevData => {
            if(prevData.length >= 20) prevData.shift();
            // console.log(prevData);
            return ([...prevData, val2]);
          });
          // client.end();
        });
        
      },
      500
    );
    // clean up interval on unmount
    return () => {
      clearInterval(interval);
    };

  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <h1>UFPB</h1>
      </header>
      <div className='main'>
        <div className='menus'>
          <div className='MensagemRecebida' style={{ backgroundColor: messageColor }}>
              <h3>Mensagem</h3>
          </div>
          
          <div className='node-wrapper'>
            <label htmlFor='nodes'>Node:</label>
            {/* <Select options={options} defaultValue={options[0]} id="nodes"></Select> */}
            <Select options={options} onChange={handleChange} defaultValue={options[0]}/>
            {selectedOption && <p>Topic: {'mqtt/ufpb-'+selectedOption.value+'/temp'}</p>}
            <p>QoS1</p>
            <p>JSON example: '&#123;"Bateria":90, "Temperatura":42, "Umidade":60&#125;'</p>
          </div>
          <div className='battery' style={{ backgroundColor: batteryColor }}>
            <h3>Battery: {batteryLevel}%</h3>
          </div>
            <div>
              <button onClick={Disconnect}>Limpar</button>
            </div>
            
          
        </div>
        <div className='data'>
          <h2> &nbsp;  &nbsp;  {topicGeral.toString()} </h2>
          <h3>      &nbsp;&nbsp;&nbsp;QoS1</h3>
          <h3>   &nbsp; Temperatura (°C)</h3>
          <ChartViewer data={dataSetOne} title="Temperatura" />
          <h3>  &nbsp; Umidade (%)</h3>
          <ChartViewer data={dataSetTwo} title="Humidade" />
        </div>
      </div>
    </div>
  );
}

export default App;

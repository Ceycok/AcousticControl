// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
let client = null;
const options = {
  clientId: 'mqttjs_6dd84101',
  keepalive: 30,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: 'WillMsg',
    payload: 'Connection Closed abnormally..!',
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
  username: '',
  password: '',
};
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
/* 
const subBtn = document.getElementById('subBtn');
const unsubBtn = document.getElementById('unsubBtn');
*/
//const sendBtn = document.getElementById('sendBtn');
const statusBtn = document.getElementById('statusBtn');
const pingBtn = document.getElementById('pingBtn');
const batteryBtn = document.getElementById('batteryBtn');
const messageBtn = document.getElementById('messageBtn');
const setAddressBtn = document.getElementById('setAddressBtn');
const broadcastBtn = document.getElementById('broadcastBtn');

const modemSelect = document.getElementById('modems');
var modemOptions = [];

connectBtn.addEventListener('click', onConnect);
disconnectBtn.addEventListener('click', onDisconnect);
//subBtn.addEventListener('click', onSub);
//unsubBtn.addEventListener('click', onUnsub);
//sendBtn.addEventListener('click', onSend);
setAddressBtn.addEventListener('click', setAddress);
statusBtn.addEventListener('click', getStatus);
pingBtn.addEventListener('click', ping);
batteryBtn.addEventListener('click', checkBattery);
messageBtn.addEventListener('click', sendMessage);
broadcastBtn.addEventListener('click', sendBroadcast);

function onConnect() {
  console.log('connecting mqtt client');
  client = mqtt.connect('mqtt://test.mosquitto.org:1883', options);
  client.on('error', (err) => {
    console.error('Connection error: ', err);
    client.end();
  });
  client.on('reconnect', () => {
    console.log('Reconnecting...');
  });
  client.on('connect', () => {
    console.log('Client connected:' + options.clientId);
    connectBtn.innerText = 'Connected';

    if (client.connected) {
      const { topic, qos } = {
        topic: 'GSU/AcousticModem/#',
        qos: 0,
      };
      client.subscribe(topic, { qos: parseInt(qos, 10) }, (error, res) => {
        if (error) {
          console.error('Subscribe error: ', error);
        } else {
          console.log('Subscribed: ', res);
        }
      });
      const { credsTopic, credsqos, payload } = {
        credsTopic: 'GSU/AcousticModem/MODEMRECEIVE',
        credsqos: 0,
        payload: ':sendCreds',
      };
      client.publish(credsTopic, payload, { qos: credsqos, retain: false });
    }
  });
  client.on('message', (topic, message) => {
    const msg = document.createElement('div');
    msg.className = 'message-body';
    msg.innerText = `${message.toString()}\nOn topic: ${topic}`;
    document.getElementById('article').appendChild(msg);

    if(topic==="GSU/AcousticModem/MODEMSEND"){
      modemOptions.push(`<option>${message}</option>`)
      modemSelect.innerHTML = modemOptions.join('');
    }
  });
}

function onDisconnect() {
  if (client.connected) {
    client.end();
    client.on('close', () => {
      connectBtn.innerText = 'Connect';
      console.log(options.clientId + ' disconnected');
    });
  }
}

function onSub() {
  if (client.connected) {
    const { topic, qos } = subscriber;
    client.subscribe(
      topic.value,
      { qos: parseInt(qos.value, 10) },
      (error, res) => {
        if (error) {
          console.error('Subscribe error: ', error);
        } else {
          console.log('Subscribed: ', res);
        }
      }
    );
  }
}

function onUnsub() {
  if (client.connected) {
    const { topic } = subscriber;
    client.unsubscribe(topic.value, (error) => {
      if (error) {
        console.error('Unsubscribe error: ', error);
      } else {
        console.log('Unsubscribed: ', topic.value);
      }
    });
  }
}

function onSend() {
  if (client.connected) {
    const { topic, qos, payload } = publisher;
    client.publish(topic.value, payload.value, {
      qos: parseInt(qos.value, 10),
      retain: false,
    });
  }
}

function setAddress() {
  if (client.connected) {
    const { topic, qos, payload } = {
      topic: 'GSU/AcousticModem/' + modemSelect.value + '/receive',
      qos: 0,
      payload: ':setAddress:' + setAddressBox.setAddressText.value,
    };
    client.publish(topic, payload, {
      qos: qos,
      retain: false,
    });
  }
}
function getStatus() {
  if (client.connected) {
    const { topic, qos, payload } = {
      topic: 'GSU/AcousticModem/' + modemSelect.value + '/receive',
      qos: 0,
      payload: ':status:',
    };
    client.publish(topic, payload, {
      qos: qos,
      retain: false,
    });
  }
}

function ping() {
  if (client.connected) {
    const { topic, qos, payload } = {
      topic: 'GSU/AcousticModem/' + modemSelect.value + '/receive',
      qos: 0,
      payload: ':ping:' + pingBox.pingText.value,
    };
    client.publish(topic, payload, {
      qos: qos,
      retain: false,
    });
  }
}

function checkBattery() {
  if (client.connected) {
    const { topic, qos, payload } = {
      topic: 'GSU/AcousticModem/' + modemSelect.value + '/receive',
      qos: 0,
      payload: ':battery:' + batteryBox.batteryText.value,
    };
    client.publish(topic, payload, {
      qos: qos,
      retain: false,
    });
  }
}

function sendMessage() {
  if (client.connected) {
    let messageSize = Buffer.byteLength(messageBox.messageContentText.value);
    const { topic, qos, payload } = {
      topic: 'GSU/AcousticModem/' + modemSelect.value + '/receive',
      qos: 0,
      payload:
        ':message:' +
        messageBox.messageAddressText.value +
        ':' +
        messageSize +
        ':' +
        messageBox.messageContentText.value,
    };
    client.publish(topic, payload, {
      qos: qos,
      retain: false,
    });
  }
}

function sendBroadcast() {
  if (client.connected) {
    let messageSize = Buffer.byteLength(
      broadcastBox.broadcastContentText.value
    );
    const { topic, qos, payload } = {
      topic: 'GSU/AcousticModem/' + modemSelect.value + '/receive',
      qos: 0,
      payload:
        ':broadcast:' + messageSize + ':' + messageBox.messageContentText.value,
    };
    client.publish(topic, payload, {
      qos: qos,
      retain: false,
    });
  }
}

onConnect();

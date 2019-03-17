const fs = require('fs');

function generateId() {
  const filPath = './src/storage/last-id.json';
  const data = fs.readFileSync(filPath, 'utf-8');
  const parseData = JSON.parse(data);
  const newData = (+parseData.last_id) + 1;
  fs.writeFile(filPath, JSON.stringify({last_id: newData}), function() {})
  return newData;
}

function writeData(item, callback) {
  const path = './src/storage/sushi.json';
  const newItem = {
    id: generateId(),
    ...item
  }
  fs.readFile(path, 'utf-8', (err, data) => {
    const parseData = JSON.parse(data);
    const newData = [
      ...parseData,
      newItem
    ];
    fs.writeFile(path, JSON.stringify(newData, null, 2), (error) => {
      if(!error) {
        callback();
      }
    });
  });
}

module.exports = {
  writeData
}
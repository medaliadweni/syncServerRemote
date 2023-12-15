const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 2500;

app.use(express.json());

app.post('/api/data', (req, res) => {
  try {
    const jsonData = req.body;
    const destination = jsonData.destination;

    if (destination === 'SidiSalah' || destination === 'MenzelChaker') {
      const fileName = `${destination}.json`;
      const filePath = path.join(__dirname, fileName);

      let existingData = [];
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileData);
      }

      const newId = generateAutoIncrementId(existingData);
      jsonData.id = newId;

      existingData.push(jsonData);

      fs.writeFileSync(filePath, JSON.stringify(existingData));

      res.status(200).send('Data added to the file');

    } else {
      res.status(400).send('Invalid destination');
    }
  } catch (error) {
    res.status(400).send('Invalid JSON data');
  }
});

app.get('/api/data/:destination', (req, res) => {
  const destination = req.params.destination;
  const filterState = req.query.state || 'PENDING'; 

  if (destination === 'SidiSalah' || destination === 'MenzelChaker') {
    const fileName = `${destination}.json`;
    const filePath = path.join(__dirname, fileName);

    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileData);

      const filteredData = jsonData.filter(entry => entry.state === filterState);

      res.status(200).json(filteredData);
    } else {
      res.status(404).send('File not found');
    }
  } else {
    res.status(400).send('Invalid destination');
  }
});

app.put('/api/data/:destination/:id', (req, res) => {
  try {
    const destination = req.params.destination;
    const idToUpdate = parseInt(req.params.id, 10);

    if (destination === 'SidiSalah' || destination === 'MenzelChaker') {
      const fileName = `${destination}.json`;
      const filePath = path.join(__dirname, fileName);

      if (fs.existsSync(filePath)) {
        let jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const entryToUpdate = jsonData.find(entry => entry.id === idToUpdate);

        if (entryToUpdate) {
          entryToUpdate.state = 'DONE';
          fs.writeFileSync(filePath, JSON.stringify(jsonData));

          res.status(200).send('Data state updated to "done"');
        } else {
          res.status(404).send('Entry not found');
        }
      } else {
        res.status(404).send('File not found');
      }
    } else {
      res.status(400).send('Invalid destination');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


function generateAutoIncrementId(dataArray) {
  const lastId = dataArray.length > 0 ? dataArray[dataArray.length - 1].id : 0;
  return lastId + 1;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
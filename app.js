
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const connectDB = require('./db');
const User = require('./models/User');
const { parseCSVLine, buildObjectFromRow, separateIntoColumns } = require('./csvParser');

const app = express();
app.use(express.json());

const CSV_PATH = process.env.CSV_PATH;
const BATCH_SIZE = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE, 10) : 1000;

if (!CSV_PATH) {
  console.error('CSV_PATH is not set in .env.');
  process.exit(1);
}

connectDB();

app.post('/import', async (req, res) => {
  try {
    const fileStream = fs.createReadStream(CSV_PATH, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    let headers = null, batch = [], totalInserted = 0, skippedRows = [];

    for await (const rawLine of rl) {
      const line = rawLine.trim();
      if (!line) continue;
      if (!headers) { headers = parseCSVLine(line).map(h => h.trim()); continue; }

      const values = parseCSVLine(line);
      const nested = buildObjectFromRow(headers, values);
      const { name, age, address, additional_info } = separateIntoColumns(nested);

      if (!name || age == null || Number.isNaN(age)) {
        skippedRows.push({ reason: 'missing name/age', data: nested });
        continue;
      }

      batch.push({ name, age, address, additional_info });
      if (batch.length >= BATCH_SIZE) {
        await User.insertMany(batch);
        totalInserted += batch.length;
        batch = [];
      }
    }

    if (batch.length) {
      await User.insertMany(batch);
      totalInserted += batch.length;
    }

    const total = await User.countDocuments();
    const groups = await User.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 20, 40, 60, 200],
          default: "> 60",
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    const counts = { "<20": 0, "20-40": 0, "40-60": 0, ">60": 0 };
    groups.forEach(g => {
      const { _id, count } = g;
      if (_id === 0) counts["<20"] = count;
      else if (_id === 20) counts["20-40"] = count;
      else if (_id === 40) counts["40-60"] = count;
      else counts[">60"] = count;
    });

    const pct = c => (total === 0 ? 0 : ((c / total) * 100).toFixed(1) + '%');

    console.log("Age-Group % Distribution");
    console.log(`<20\t${pct(counts["<20"])}`);
    console.log(`20–40\t${pct(counts["20-40"])}`);
    console.log(`40–60\t${pct(counts["40-60"])}`);
    console.log(`>60\t${pct(counts[">60"])}`);

    res.json({
      message: 'Import completed successfully',
      totalInserted,
      skippedRowsCount: skippedRows.length
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log(` Server started on port ${process.env.PORT || 3000}`)
);

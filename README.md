# 🧩 CSV to JSON MongoDB Importer

A Node.js + Express application that reads a CSV file, manually parses it into JSON without using external CSV parsers, stores the data in MongoDB, and calculates age-group distribution.

---

## 🚀 Features

- Converts CSV to deeply nested JSON objects  
- Handles dot notation (e.g., `address.city`, `work.company.name`)  
- Inserts parsed data into MongoDB  
- Calculates and prints age-group distribution (<20, 20–40, 40–60, >60)  
- Efficiently streams large files (50k+ rows)  
- Built with clean, production-quality Node.js + Express code  

---

## 🧰 Tech Stack

| Component | Technology |
|------------|-------------|
| Server | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Environment | dotenv |
| Language | JavaScript (ES6) |

---

2️⃣ Install Dependencies
npm install


3️⃣ Configure Environment Variables

Create a .env file in the root directory:

PORT=3000
CSV_PATH=./data/users.csv
MONGO_URI=mongodb://localhost:27017/csv_importer
BATCH_SIZE=1000

📂 Folder Structure
csv-to-json-mongodb-importer/
│
├── app.js
├── csvParser.js
├── db.js
├── models/
│   └── User.js
├── data/
│   └── users.csv
├── package.json
├── .env.example
└── README.md

▶️ Run the Server
node app.js

📤 Import CSV Data

Using PowerShell:

curl -Method POST http://localhost:3000/import

Response

StatusCode        : 200
StatusDescription : OK
Content           : {"message":"Import completed
                    successfully","totalInserted":6,"skippedRowsCount":0}  
RawContent        : HTTP/1.1 200 OK
                    Connection: keep-alive
                    Keep-Alive: timeout=5
                    Content-Length: 82
                    Content-Type: application/json; charset=utf-8
                    Date: Tue, 11 Nov 2025 07:47:53 GMT
                    ETag: W/"52-Wm6a9zXJtpSUtqIvGfvu...
Forms             : {}
Headers           : {[Connection, keep-alive], [Keep-Alive, timeout=5],    
                    [Content-Length, 82], [Content-Type,
                    application/json; charset=utf-8]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 82

📊 Age Distribution Example
Age Group	% Distribution
<20	16.7%
20–40	50.0%
40–60	16.7%
>60	16.7%


MongoDB Document
{
  "name": "Sanya Mehta",
  "age": 22,
  "address": {
    "line1": "12 MG Road",
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "additional_info": {
    "gender": "female"
  }
}


🧾 License

MIT License © 2025 Shubham Vishwakarma

require("dotenv").config();


const http = require("http");
const fs = require("fs");
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "expenseapp"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    console.log("Connected to MySQL database");
});

const server = http.createServer((req, res) => {

    // Frontend
    if (req.method === "GET" && req.url === "/") {

        fs.readFile(
            "/Users/gayatri/three-tier-devops/frontend/index.html",
            (err, data) => {

                if (err) {
                    res.writeHead(500);
                    res.end("Error loading frontend");
                    return;
                }

                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(data);
            }
        );

        return;
    }

    // GET expenses
    if (req.method === "GET" && req.url === "/expenses") {

        db.query("SELECT * FROM expenses", (err, results) => {

            if (err) {
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({error: "Database error"}));
                return;
            }

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(results));
        });

        return;
    }

    // POST expense
    if (req.method === "POST" && req.url === "/expenses") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            const expense = JSON.parse(body);

            const sql =
                "INSERT INTO expenses (amount, description) VALUES (?, ?)";

            db.query(
                sql,
                [expense.amount, expense.description],
                (err, result) => {

                    if (err) {
                        res.writeHead(500, {
                            "Content-Type": "application/json"
                        });

                        res.end(JSON.stringify({
                            error: "Database error"
                        }));

                        return;
                    }

                    res.writeHead(201, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        message: "Expense added successfully",
                        id: result.insertId
                    }));
                }
            );
        });

        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(3000, () => {
    console.log("Backend running on port 3000");
});

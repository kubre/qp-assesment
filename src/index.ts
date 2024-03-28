import express from "express";

const app = express();

app.get("/", (_, res) => {
    res.send("Hello World!");
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


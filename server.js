import express from "express"
import pg from "pg"
import axios from "axios"
import bodyParser from "body-parser"
import "dotenv/config"

const api_endpoint = "https://covers.openlibrary.org/b/isbn/0385472579-L.jpg"


const app = express();
const port = 3000;
const client = new pg.Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    database: process.env.PG_DB,
    port: process.env.PG_PORT,
    password: process.env.PG_PASS
})
client.connect()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true}))


app.get("/", async (req, res) => {
    const response = await client.query("SELECT * FROM books")
    const books = response.rows
    console.log(books)
    res.render("index.ejs", {books})
})

app.get("/add", (req, res) => {
    res.render("add.ejs")
})

app.post("/add", (req, res) => {
    console.log(req.body.title)
    console.log(req.body.isbn)
    console.log(req.body.description)
    console.log(req.body.summary)
    res.redirect("/")
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})
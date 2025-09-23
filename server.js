import express from "express"
import pg from "pg"
import axios from "axios"
import bodyParser from "body-parser"
import "dotenv/config"

const api_endpoint = "https://covers.openlibrary.org/b/isbn/"


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
    res.render("index.ejs", {books})
})

app.post("/", (req, res) => {
    console.log(req.body.action)
    res.redirect("/")
})

app.get("/add", (req, res) => {
    res.render("add.ejs")
})

app.post("/add", async (req, res) => {
    const title = req.body.title
    const isbn = req.body.isbn
    const author = req.body.author
    const summ = req.body.summary
    const img = `${api_endpoint}${isbn}-L.jpg`
    await client.query("INSERT INTO books (title, author, summary, isbn, image_url) VALUES ($1, $2, $3, $4, $5)", 
        [title, author, summ, isbn, img])
    res.redirect("/")
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})
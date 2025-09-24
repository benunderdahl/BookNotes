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

app.post("/", async (req, res) => {
    const id = req.body.book_id
    if (req.body.action === "read") {
        const result = await client.query("SELECT * FROM books WHERE id = $1", [id])
        const book = result.rows[0]
        res.render("read.ejs", { book })
        return 
    } else if (req.body.action === "delete") {
        await client.query("DELETE FROM books WHERE id = $1", [id])
        return 
    } else if (req.body.action === "update") {
        res.redirect(303, `/update/${id}`)
        return
    }
    res.redirect("/")
})

app.get("/update/:id", async (req, res) => {
    const { id } = req.params
    const result = await client.query("SELECT * FROM books WHERE id = $1", [id])
    const book = result.rows[0]
    res.render("update.ejs", { book })
})

app.post("/update", async (req, res) => {
    const { id, title, author, summary, isbn, image_url } = req.body
    await client.query(
      "UPDATE books SET title=$1, author=$2, summary=$3, isbn=$4, image_url=$5 WHERE id=$6",
      [title, author, summary, isbn, image_url, id])
    res.redirect(303, "/")
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
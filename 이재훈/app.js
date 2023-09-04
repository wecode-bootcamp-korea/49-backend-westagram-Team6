const http = require('http')
const express = require('express')
const { DataSource } = require('typeorm');
// const mysql = require('mysql')

const myDataSource = new DataSource({
    // const myDataSource = mysql.createConnection({
    type: 'mysql',
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '',
    database: 'westagram'
})


const app = express()

app.use(express.json()) // for parsing application/json

app.get("/", async (req, res) => {
    try {
        return res.status(200).json({ "message": "Welcome to my server!" })
    } catch (err) {
        console.log(err)
    }
})

//1. API 로 users 화면에 보여주기
app.get('/users', async (req, res) => {
    try {
        // query DB with SQL
        // Database Source 변수를 가져오고.
        // SELECT id, name, password FROM users;
        const userData = await myDataSource.query(`SELECT id, name, email FROM users;`)

        // console 출력

        console.log("USER DATA :", userData)
g
        // FRONT 전달

        return res.status(200).json({
            "users": userData
        })
    } catch (error) {
        console.log(error)
    }
})
//2. users 생성

app.post("/users", async (req, res) => {
    try {
        // 1. user 정보를 frontend로부터 받는다. (프론트가 사용자 정보를 가지고, 요청을 보낸다) 
        const me = req.body

        // 2. user 정보 console.log로 확인 한 번!
        console.log("ME: ", me)

        // 3. DATABASE 정보 저장.

        const name = me.name
        const password = me.password
        const email = me.email

        const userData = await myDataSource.query(`
      INSERT INTO users (
        name, 
        password,
        email
      )
      VALUES (
        '${name}',
        '${password}', 
        '${email}'
      )
    `)

        // 4. DB data 저장 여부 확인
        console.log('iserted user id', userData.insertId)

        // 5. send response to FRONTEND
        return res.status(201).json({
            "message": "userCreated"
        })
    } catch (err) {
        console.log(err)
    }
})


// 과제 3 DELETE 
// 가장 마지막 user를 삭제하는 엔드포인트
app.delete("/users", async (req, res) => {
    try {

    } catch (err) {
        console.log(err)
    }
})

// 과제 4 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.

app.put("/users/1", async (req, res) => {
    try {
        const newName = req.body.data.name
    } catch (err) {
        console.log(err)
    }
})

const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
    try {
        server.listen(8000, () => console.log(`Server is listening on 8000`))
    } catch (err) {
        console.error(err)
    }
}

myDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
// myDataSource.connect()

// myDataSource.query('SELECT * from Users', (error, rows, fields) => {
//     if (error);
//     console.log('User info is: ', rows);
// });

// myDataSource.end();
start()
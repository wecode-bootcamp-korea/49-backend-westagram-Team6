const http = require('http')
const express = require('express')
const { DataSource } = require('typeorm');
const dotenv = require("dotenv")

dotenv.config()

require("dotenv").config();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);

const myDataSource = new DataSource({
 type: 'mysql', 
 host: 'localhost', 
 port: '3306',
 username: 'root',
 password: '1234',
 database: 'westagram'
})

const app = express()

app.use(express.json()) // for parsing application/json

app.get("/", async(req, res) => {
  try {
    return res.status(200).json({"message": "Welcome to Soheon's server!"})
  } catch (err) {
    console.log(err)
  }
})

//1. API 로 users 화면에 보여주기
app.get('/users', async(req, res) => {
	try {
    // query DB with SQL
    // Database Source 변수를 가져오고.
    // SELECT id, name, password FROM users;
    const userData = await myDataSource.query(`SELECT id, name, email FROM users`)

    // console 출력

    console.log("USER DATA :", userData)

    // FRONT 전달

    return res.status(200).json({
      "users": userData
    })
	} catch (error) {
    console.log(error)
    return res.status(error.statusCode).json({
      "message": error.message
    })
	}
})
//2. users 생성

app.post("/users", async(req, res) => {
	try {
    // 1. user 정보를 frontend로부터 받는다. (프론트가 사용자 정보를 가지고, 요청을 보낸다) 
    const me = req.body
    const {name,password,email} = me;

    // 2. user 정보 console.log로 확인 한 번!
    console.log("ME: ", me)

    // 3. DATABASE 정보 저장.

   // email, name, password가 다 입력되지 않은 경우
   if (email === undefined || name === undefined || password === undefined) {
    const error = new Error("KEY_ERROR")
    error.statusCode = 400
    throw error
  }

  // (필수) 비밀번호가 너무 짧을 때
  if (password.length < 8) {
    const error = new Error("INVALID_PASSWORD")
    error.statusCode = 400
    throw error
  }

  // (심화, 진행) 이메일이 중복되어 이미 가입한 경우
  // 1. 유저가 입력한 Email인 'shlee@wecode.co.kr'이 이미 우리 DB에 있는지 확인한다.

  const existingUser = await myDataSource.query(`
    SELECT id, email FROM users WHERE email='${email}';
  `)

  console.log('existing user: ', existingUser)
  
  // 2. 있으면, 즉, 중복이면 아래 if문 실행
  // 
  if (existingUser.length>0) { // existing user 이용해서 판별`
    const error = new Error("DUPLICATED_EMAIL_ADDRESS")
    error.statusCode = 400
    throw error
  }
/*
  // (심화, 선택) 비밀번호에 특수문자 없을 때
  if (password) {
    const error = new Error("")
    error.statusCode = 400
    throw error
  }
*/
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
    console.log('inserted user id', userData.insertId)

    // 5. send response to FRONTEND
		return res.status(201).json({
      "message": "userCreated" 
		})
	} catch (err) {
    console.log(err)
    return res.status(error.statusCode).json({
      "message": error.message
    })
    
	}
})


// 과제 3 DELETE 
// 가장 마지막 user를 삭제하는 엔드포인트
app.delete("/users", async(req, res) => {
  try {

  } catch (err) {
    console.log(err)
  }
})

// 과제 4 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.

app.put("/users/1", async(req, res) => {
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

start()
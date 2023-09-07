const http = require('http')
const express = require('express')
const { DataSource } = require('typeorm');
const dotenv = require("dotenv");
const { error } = require('console');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const morgan = require('morgan')

dotenv.config()

const myDataSource = new DataSource({
 type: 'mysql', 
 host: 'localhost', 
 port: '3306',
 username: 'root',
 password: '1234',
 database: 'westagram'
})

// .env

// DB_HOST = localhost
// DB_USER = root
// DB_PASS = myPassword


// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_PASS:", process.env.DB_PASS);

require("dotenv").config();

app.use(morgan("dev"))
app.use(cors())
app.use(express.json()) // for parsing application/json

app.get("/", async(req, res) => {
  try {
    return res.status(200).json({"message": "Welcome to Seunghyuk's server!"})
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
	}
})
//2. users 생성

app.post("/users/signup", async(req, res) => {
	try {
    // 1. user 정보를 frontend로부터 받는다. (프론트가 사용자 정보를 가지고, 요청을 보낸다) 
    const me = req.body

    // 2. user 정보 console.log로 확인 한 번!
    console.log("ME: ", me)

    // 3. DATABASE 정보 저장.

    // const name2 = me.name
    // const password2 = me.password
    // const email2 = me.email

    const { name, password, email } = me // 구조분해할당

    // name, password, email이 다 입력되지 않은 경우
    if(email === undefined || name === undefined || password === undefined){
      const error = new Error("KEY_ERROR")
      error.statusCode = 400
      throw error
    }

    // 비밀번호 길이를 체크
    if(password.length < 8) {
      const error = new Error("INVALID_PASSWORD")
      error.statusCode = 400
      throw error
      // throw 밑에는 진행되지않으며
      // 밑에 catch(err)로 바로 내려가게됨
   }

   // 이메일이 중복되어 이미 가입한 경우
   // 1. 유저가 입력한 Email이 이미 DB에 있는지 확인
   const useremailData = await myDataSource.query(`
    SELECT id, email FROM users WHERE email = '${email}';
    `)

    console.log("useremail :" , useremailData);
    // email이 있는 경우 : 객체가 담긴 배열 형태
    // email이 없는 경우 : 빈 배열
    console.log(useremailData !== req.body.email)

   // 2. 중복이면 if문 실행
   if(useremailData.length>0) { // useremailData 이용해서 판별
    const error = new error("DUPLICATED_EMAIL_ADDRESS")
    error.statusCode = 400
    throw error
   }

    // 비밀번호에 특수문자 없을 때
    // if(password2) {
    //   const error = new Error("")
    //   error.statusCode = 400
    //   throw error
    // }

      // await를 넣지않으면 데이터가 들어가는 동안
      // 다른 코드가 실행될 수 있음
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
    return res.status(error.statusCode).json({
      "message" : "INVALID_PASSWORD"
    })
		console.log(err)
	}
})


// generate token
// 1. use library allowing generating token
// 2. {"id" : 10} 1hour
// 3. signature


// 로그인
// 로그인 성공 시 : "token":"String"
app.post("/login", async(req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    // { email, password } = req.body

    // email, password KEY_ERROR 확인

    const useremailData = await myDataSource.query(`
    SELECT id, email FROM users WHERE email = '${email}';
    `)
    // Email 가진 사람 있는지 확인
    // if 있으면 -> Error
    // 없으면 -> 정상 진행
    if(useremailData.length < 0) { // useremailData 이용해서 판별
      const error = new error("DUPLICATED_EMAIL_ADDRESS")
      error.statusCode = 400
      throw error
     }

    // Password 비교
    // 유저가 입력한 password === DB에서 가져온 password
    // if 다르면 -> Error
    // 같으면 -> 정상진행

    const userpwData = await myDataSource.query(`
    SELECT id, pw FROM users WHERE password = '${password}';
    `)
     if(password != userpwData) {
      const error = new error("PASSWORD_PROTECTED")
      error.statusCode = 400
      throw error
     }
    

    return res.status(200).json({
      "message" : "LOGIN_SUCCESS"
    })

  } catch (error) {
    console.log(error)
  }
})


// 과제 3 DELETE 
// 가장 마지막 user를 삭제하는 엔드포인트
app.delete("/users", async(req, res) => {
  try {
    users.pop()
    return res.status(200).json({
      users
    })
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
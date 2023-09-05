const http = require('http')
const express = require('express')
const { DataSource } = require('typeorm');
// const mysql = require('mysql')
// ^^^ npm 으로 설치된 함수들을 불러오는 것.


const myDataSource = new DataSource({
    // const myDataSource = mysql.createConnection({
    type: 'mysql',
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '',
    database: 'westagram'
})
// ^^^ 나의 데이터 베이스는 여기다 이걸 불러오겠다 라고 하는것.

const app = express()
// ^^^ 익스프레스 함수를 여기서 부터 실행을 시키겠다.

app.use(express.json()) // for parsing application/json
// ^^^ express.json() 이걸 사용하겠다

app.get("/", async (req, res) => {
    // ^^^ HTTP의 메서드 CRUD(create read update delect)기능인 GET 으로
    //     정보를 가져온다 라는 뜻
    try {   // try의 내부는 예외처리 에러나, 에러가 날수있는 함수를
        // try 안에 넣는다.
        return res.status(200).json({ "message": "Welcome to my server!" })
        // res는 대답한다라는 의미고, status 상태 .json으로 반환한다.

    } catch (err) { /// << 개발자가 만든 에러를 잡는다는 것
        console.log(err) // 콘솔창에 에러를 알린다
    }
})

//1. API 로 users 화면에 보여주기
app.get('/users', async (req, res) => {
    try {

        // userData 라는 함수를 선언한다.
        // await 자바스크립트 특성상 함수가 다 끝나지 않아도
        // 다음함수가 실행 되기에, 잠시만 기다리라는 의미로 쓰인다.
        // 앞서 선언한 myDataSource MySQL데이터베이스를 불러온다.
        // 데이터 베이스를 query하여 MySQL 함수를 사용하여 필요한 것을
        // 불러온다.
        // 데이터 베이스의 users 테이블에서 id, name, email, age를
        // 불러온다.
        const userData = await myDataSource.query(`
            
        SELECT id, name, email, age FROM users;
        `)

        // 유저 데이터를 콘솔창에 출력한다.
        console.log("USER DATA :", userData)

        return res.status(200).json({
            // ^^^ 프론트로 리턴하여 데이터를 전달한다.
            "users": userData
            // ^^^ 유저의 데이터를 전달한다. 
        })
    } catch (err) {
        console.log(err)
    }
})
//2. users 생성

app.post("/users", async (req, res) => {
    try {
        // 1. user 정보를 frontend로부터 받는다.
        // (프론트가 사용자 정보를 가지고, 요청을 보낸다) 
        const me = req.body

        // 2. user 정보 console.log로 확인 한 번!
        console.log("ME: ", me)

        // 3. DATABASE 정보 저장.

        // const name = me.name
        // const password = me.password
        // const email = me.email
        // const age = me.age

        //          ^^^ 아래 변수는 위의 변수들과 같다.
        const { name, password, email, age } = name
        // 아래 MySQL은 유저의 정보를 기입하는 것이다.
        // INSERT INTO users
        // ^^^ users 테이블에 데이터를 추가한다.
        // 괄호 안에 있는 것들을 추가한다 
        // name, password, email, age
        // VALUES 다음의 괄호에는 기입될 값을 표시한다. 
        const userData = await myDataSource.query(`
      INSERT INTO users (
        name, 
        password,
        email,
        age
      )
      VALUES (
        '${name}',
        '${password}', 
        '${email}',
        '${age}'
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
        const params = users.id
        const userData = await myDataSource.query(`
        DELECT FROM 
        users id=?
        `+ params
        )

    } catch (err) {
        console.log(err)
    }
})

// 과제 4 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.

app.put("/users/1", async (req, res) => {
    try {
        let body = req.body
        let params = [users.id, users.name, users.email, users.password]
        const userData = await myDataSource.query(`
        UPDATE users
        SET 
            id =?,
            name =?,
            email =?,
            password =?
            ` + req.params
        )

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
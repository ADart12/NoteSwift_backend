import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/cofig/dbConfig.js';

connectDB();

app.listen(3000, () => {
    console.log("Sever is listing at post 3000")
})











//bhattaaditya976_db_user
//uRuNBu5s7jeqIMO5

//mongodb+srv://bhattaaditya976_db_user:<db_password>@cluster0.woxdc0n.mongodb.net/?appName=Cluster0
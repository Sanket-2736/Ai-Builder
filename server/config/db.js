import mongoose from "mongoose";

export async function connectToDatabase() {
    mongoose.connection.on('connected', ()=> {
        console.log('Connected to Mongodb')
    });

    await mongoose.connect(process.env.MONGODB_URL);
}
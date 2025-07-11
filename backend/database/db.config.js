import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      "MONGO DB CONNECTED SUCCESSFULLY :) with host ",
      connection.connection.host
    );
  } catch (err) {
    console.log("Failed to coneect to the Database :(");
    process.exit(1); //1 is failure and 0 is success
  }
};

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");

// mongoose.connect("mongodb://localhost/compilerapp", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }, (err) => {
//   if(err){
//     console.log(err);
//     process.exit(1);
//   }
//   else{
//     console.log("Sucessfully connected to mongoDb database")
//   }
// })

mongoose
  .connect("mongodb://localhost/compilerapp")
  .then(() => console.log("Connected to mongoDB!"));

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.json({ hello: "world!" });
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  // console.log(language, code.length)
  if (code === undefined)
    res
      .status(400)
      .json({ success: false, error: "The code body cannot be empty" }); // bad request if there is no code

  try {
    // we need to generate a cpp file with content from request
    const filepath = await generateFile(language, code);
    // we need to run the file and then send the response

    let output;
    if (language === "cpp") {
      output = await executeCpp(filepath);
    } else {
      output = await executePy(filepath);
    }

    return res.json({ filepath, output });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});

import express from "express";

const app = express();
app.use(express.json());
 
app.get("/", async (req, res) => {
  try { 
    res.json({ message: "Working fine" });
  } catch (error) {
    console.log(error);   
  } 
});

app.get("/get-data", async (req, res) => {
  try { 
    res.json({ message: "Working fine get data " });
  } catch (error) {
    console.log(error);   
  } 
});

 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

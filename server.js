const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔴 Replace this later with your MongoDB URL
// mongoose.connect("mongodb+srv://marshu817_db_user:Rd5XxGNKdhZMsd0a@cluster0.wlvlyyx.mongodb.net/?appName=Cluster0");
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
  });
const BillSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  vehicle: String,
  items: Array,
  total: Number,
  date: { type: Date, default: Date.now }
});

const Bill = mongoose.model("Bill", BillSchema);

// ✅ Save bill
app.post("/save-bill", async (req, res) => {
  const bill = new Bill(req.body);
  await bill.save();
  res.send("Bill Saved");
});

// ✅ Get all bills
app.get("/bills", async (req, res) => {
  const bills = await Bill.find();
  res.json(bills);
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});

// ✅ DELETE BILL
app.delete("/delete-bill/:id", async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    res.status(500).send("Error deleting bill");
  }
});
// ✅ UPDATE BILL
app.put("/update-bill/:id", async (req, res) => {
  try {
    await Bill.findByIdAndUpdate(req.params.id, req.body);
    res.send("Updated");
  } catch (err) {
    res.status(500).send("Error updating bill");
  }
});
// ✅ DAILY REPORT
app.get("/daily-report", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Get today's bills
    const bills = await Bill.find({
      date: { $gte: start, $lte: end }
    });

    const total = bills.reduce((sum, bill) => sum + bill.total, 0);

    res.json({
      total,
      count: bills.length
    });

  } catch (err) {
    res.status(500).send("Error fetching report");
  }
});

// ✅ MONTHLY REPORT
app.get("/monthly-report", async (req, res) => {
  try {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const bills = await Bill.find({
      date: { $gte: start, $lte: end }
    });

    const total = bills.reduce((sum, bill) => sum + bill.total, 0);

    res.json({
      total,
      count: bills.length
    });

  } catch (err) {
    res.status(500).send("Error fetching monthly report");
  }
});
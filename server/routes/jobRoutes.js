const express = require("express");

const router = express.Router();

const {

postJob,
getAllJobs

}=require("../controllers/jobController");
// Post Job
router.post("/post", postJob);
router.get("/", getAllJobs);

module.exports = router;
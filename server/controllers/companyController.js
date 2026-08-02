const db = require("../config/db");

// Company Registration

const registerCompany = (req, res) => {

    const { company_name, email, password, location } = req.body;

    const sql = `
        INSERT INTO companies
        (company_name,email,password,location)
        VALUES (?,?,?,?)
    `;

    db.query(sql,
        [company_name,email,password,location],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.status(500).json({

                    success:false,
                    message:"Registration Failed"

                });

            }

            res.status(201).json({

                success:true,
                message:"Company Registered Successfully"

            });

        });

};

module.exports={

registerCompany

};
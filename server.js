var express = require("express");
var Fileuploader = require("express-fileupload");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBD5_EbO5GpLMksZaJxwx9RnwcCfXVE0GM");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
var mysql2 = require("mysql2");
var cloudinary = require("cloudinary").v2;
var app = express();
app.use(Fileuploader());
app.use(express.static("public"));
app.listen(2025, function () {
    console.log("Server started at port no. : 2025");
})
app.use(express.urlencoded(true));

cloudinary.config({
    cloud_name: 'dcpevynyf',
    api_key: '585479323533719',
    api_secret: 'bF50PxvOY44TvaKLaXIvmnjuHSY'
});
let dbConfig = "mysql://avnadmin:AVNS_P-FACGRBDASQQsvWSOg@mysql-62a3b6c-manglaankush2005-d286.e.aivencloud.com:26331/defaultdb";

let mySqlVen = mysql2.createConnection(dbConfig);
mySqlVen.connect(function (error) {
    if (error == null)
        console.log("AiVen Connected Successfully");
    else
        console.log(error.message)
})
async function RajeshBansalKaChirag(imgurl) {
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    console.log(jsonData);

    return jsonData

}

app.post("/picreader", async function (req, resp) {
    let fileName;
    if (req.files != null) {
        fileName = req.files.imggg.name;
        let locationToSave = __dirname + "/public/uploads/" + fileName;
        req.files.imggg.mv(locationToSave);
        try {
            await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {

                let jsonData = await RajeshBansalKaChirag(picUrlResult.url);

                resp.send(jsonData);

            });

            //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
            // resp.send(respp);
            // console.log(typeof(respp));
        }
        catch (err) {
            resp.send(err.message)
        }

    }
})
app.get("/", function (req, resp) {
    console.log(__dirname);
    console.log(__filename);
    let a = __dirname + "/public/index.html";
    resp.sendFile(a);
})
app.get("/sign-up", function (req, resp) {
    let emailid = req.query.emailid;
    let passwords = req.query.passwords;
    let usertype = req.query.usertype;

    mySqlVen.query("insert into users values (?, ?, ?, current_date(), 1)",
        [emailid, passwords, usertype],
        function (error) {
            if (error == null)
                resp.send("Successfully signed up!");
            else
                resp.send("Error:" + error.message);
        }
    );
});
app.get("/do-login", function (req, resp) {
    let emailid = req.query.emailid;
    let passwords = req.query.passwords;
    mySqlVen.query("select * from users where emailid = ? and passwords = ?", [emailid, passwords], function (err, allRecords) {

        if (allRecords.length == 1) {
            let status = allRecords[0].status;

            if (status == 0)
                resp.send("Blocked");
            else if (status == 1)
                resp.send(allRecords[0].usertype);

        }
        else {
            resp.send("Wrong");
        }
    });
});
app.post("/do-sendserver", async function (req, resp) {
    let picurl = "nopic.jpg";

    if (req.files) {
        const fName = req.files.filepic.name;
        const fullPath = __dirname + "/public/uploads/" + fName;
        req.files.filepic.mv(fullPath);
        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }

    let emailid = req.body.txtEmail3;
    let orgname = req.body.txtorgname;
    let regnumber = req.body.txtrn;
    let address = req.body.txtaddress;
    let city = req.body.txtcity;
    let sports = req.body.txtsports;
    let website = req.body.urlweb;
    let insta = req.body.urlinsta;
    let head = req.body.txtorghead;
    let contact = req.body.contactn;
    let otherinfo = req.body.otherinfo;
    mySqlVen.query("insert into organizers values (?,?,?,?,?,?,?,?,?,?,?,?)",
        [emailid, orgname, regnumber, address, city, sports, website, insta, head, contact, picurl, otherinfo],
        function (error) {
            if (error == null)
                resp.send("Successfully signed up!");
            else
                resp.send("Error: " + JSON.stringify(error));

        }
    );
});
app.post("/do-publishevent", function (req, resp) {
    let rid;
    let emailid = req.body.emailid;
    let event = req.body.event;
    let doe = req.body.doe;
    let toe = req.body.toe;
    let address = req.body.address;
    let city = req.body.city;
    let sports = req.body.sports;
    let minage = req.body.minage;
    let maxage = req.body.maxage;
    let lastdate = req.body.lastdate;
    let fee = req.body.fee;
    let prize = req.body.prize;
    let contact = req.body.contact;
    mySqlVen.query("insert into tournaments values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [null, emailid, event, doe, toe, address, city, sports, minage, maxage, lastdate, fee, prize, contact],
        function (error) {
            if (error == null)
                resp.send("Successfully signed up!");
            else
                resp.send("Error:" + error.message);
        }
    );
});
app.post("/update-user", async function (req, resp) {
    let picurl = "";
    if (req.files != null) {
        let fName = req.files.filepic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.filepic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;
            console.log(picurl);
        });
    }
    else
        picurl = req.body.hdn;
    let emailid = req.body.txtEmail3;
    let orgname = req.body.txtorgname;
    let regnumber = req.body.txtrn;
    let address = req.body.txtaddress;
    let city = req.body.txtcity;
    let sports = req.body.txtsports;
    let website = req.body.urlweb;
    let insta = req.body.urlinsta;
    let head = req.body.txtorghead;
    let contact = req.body.contactn;
    let otherinfo = req.body.otherinfo;

    mySqlVen.query("update organizers set orgname=?,regnumber=?,address=?,city=?,sports=?,website=?,insta=?,head=?,contact=?,otherinfo=?,picurl=? where emailid=?",
        [orgname, regnumber, address, city, sports, website, insta, head, contact, otherinfo, picurl, emailid], function (errKuch, result) {
            if (errKuch == null) {
                if (result.affectedRows == 1)
                    resp.send("Updation done successfulyy!!!");
                else
                    resp.send("Inavlid email Id");
            }
            else
                resp.send("Error: " + JSON.stringify(errKuch));
        })

})
app.get("/get-one", function (req, resp) {
    emailid = req.query.emailid
    mySqlVen.query("select * from organizers where emailid=?", [emailid], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    })
})
app.get("/do-fetch-all-users", function (req, resp) {
    let emailid = req.query.emailid;
    mySqlVen.query("select * from tournaments where emailid=?", [emailid], function (err, allRecords) {
        if (err == null) {
            if (allRecords.length != 0)
                resp.send(allRecords);
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err);
    })
})
app.get("/do-delete-tournament", function (req, resp) {
    let rid = req.query.rid;

    if (!rid) {
        resp.send("Missing 'rid' parameter");
        return;
    }

    mySqlVen.query("delete from tournaments where rid = ?", [rid], function (err, result) {
        if (err == null) {
            if (result.affectedRows > 0)
                resp.send("Tournament deleted successfully.");
            else
                resp.send("No tournament found with the given ID.");
        } else {
            resp.send("Error: " + err.message);
        }
    });
});
app.get("/do-fetch-all-user2", function (req, resp) {
    mySqlVen.query("select * from tournaments", function (err, allRecords) {
        resp.send(allRecords);
    })
})
app.get("/do-fetch-all-user3", function (req, resp) {
    mySqlVen.query("select * from users", function (err, allRecords) {
        resp.send(allRecords);
    })
})
app.get("/block-user", function (req, resp) {
    let emailid = req.query.emailid;
    mySqlVen.query("update users set status=0 where emailid=?", [emailid], function (err, result) {
        if (err)
            resp.send("Error: " + err.message);
        else
            resp.send("User blocked");
    });
});
app.get("/resume-user", function (req, resp) {
    let emailid = req.query.emailid;
    mySqlVen.query("update users set status=1 where emailid=?", [emailid], function (err, result) {
        if (err)
            resp.send("Error: " + err.message);
        else
            resp.send("User resumed");
    });
});
app.get("/do-fetch-all-tournaments", function (req, resp) {
    console.log(req.query)
    mySqlVen.query("select * from tournaments where city=? and sports=?", [req.query.kuchCity, req.query.kuchGame], function (err, allRecords) {
        console.log(allRecords)
        resp.send(allRecords);
    })
})
app.get("/do-fetch-all-cities", function (req, resp) {
    mySqlVen.query("select distinct city from tournaments", function (err, allRecords) {
        resp.send(allRecords);
    })
})
app.get("/update-password", function (req, res) {
    var emailid = req.query.emailid;
    var oldpwd = req.query.oldpassword;
    var newpwd = req.query.newpassword;

    mySqlVen.query("update users set passwords=? where emailid=? AND passwords=?", [newpwd, emailid, oldpwd], function (err, result) {
        if (err) {
            res.send({ message: "Database error: " + err.message });
        } else if (result.affectedRows == 0) {
            res.send({ message: "Invalid Email ID or Old Password" });
        } else {
            res.send({ message: "Password Updated Successfully" });
        }
    });
});
app.get("/do-show-org", function (req, resp) {
    mySqlVen.query("select * from organizers", function (err, allRecords) {
        resp.send(allRecords);
    })
})
app.get("/do-show-player", function (req, resp) {
    mySqlVen.query("select * from players", function (err, allRecords) {
        resp.send(allRecords);
    })
})
app.post("/do-make-profile", async function (req, resp) {
    let acardpicurl = "";
    let profilepicurl = "";
    let jsondata = {};

    // 🔧 Convert 'DD-MM-YYYY' → 'YYYY-MM-DD'
    function formatDOB(dateStr) {
        try {
            const [dd, mm, yyyy] = dateStr.split("-");
            return `${yyyy}-${mm}-${dd}`;
        } catch (e) {
            return null;
        }
    }

    try {

        if (req.files?.acardPic) {
            let acardPath = __dirname + "/public/uploads/" + req.files.acardPic.name;
            await req.files.acardPic.mv(acardPath);

            await cloudinary.uploader.upload(acardPath).then(async function (picUrlResult) {
                acardpicurl = picUrlResult.url;
                console.log("Aadhaar Uploaded:", acardpicurl);
                jsondata = await RajeshBansalKaChirag(acardpicurl);
            });
        } else {
            acardpicurl = "nopic.jpg";
        }


        if (req.files?.profilepic) {
            let profilePath = __dirname + "/public/uploads/" + req.files.profilepic.name;
            await req.files.profilepic.mv(profilePath);

            await cloudinary.uploader.upload(profilePath).then(function (picUrlResult) {
                profilepicurl = picUrlResult.url;
                console.log("Profile pic Uploaded:", profilepicurl);
            });
        } else {
            profilepicurl = "nopic.jpg";
        }


        let emailid = req.body.inputEmail1;
        let address = req.body.inputAdr;
        let contact = req.body.inputNum;
        let game = req.body.inputGame;
        let otherinfo = req.body.inputinfo;


        let dob = formatDOB(jsondata.dob);
        if (!dob || isNaN(Date.parse(dob))) {
            return resp.send(" Invalid date format in Aadhaar: " + jsondata.dob);
        }

        mySqlVen.query("insert into players (emailid, acardpicurl, profilepicurl, name, dob, gender, address, contact, game, otherinfo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [emailid, acardpicurl, profilepicurl, jsondata.name, dob, jsondata.gender, address, contact, game, otherinfo],
            function (error) {
                if (error == null)
                    resp.send(" Profile made successfully!");
                else
                    resp.send(" Database error: " + error.message);
            }
        );

    } catch (err) {
        console.error("Server error:", err);
        resp.send("Server error: " + err.message);
    }
});
app.post("/update-player", async function (req, resp) {
    let acardpicurl = req.body.hdnAcard || "nopic.jpg";
    let profilepicurl = req.body.hdnProfile || "nopic.jpg";
    let jsondata = {};

    function formatDOB(dateStr) {
        try {
            const [dd, mm, yyyy] = dateStr.split("-");
            return `${yyyy}-${mm}-${dd}`;
        } catch (e) {
            return null;
        }
    }

    try {
        if (req.files?.acardPic) {
            let acardPath = __dirname + "/public/uploads/" + req.files.acardPic.name;
            await req.files.acardPic.mv(acardPath);

            await cloudinary.uploader.upload(acardPath).then(async function (picUrlResult) {
                acardpicurl = picUrlResult.url;
                console.log("Aadhaar Uploaded:", acardpicurl);
                jsondata = await RajeshBansalKaChirag(acardpicurl);
            });
        }

        if (req.files?.profilepic) {
            let profilePath = __dirname + "/public/uploads/" + req.files.profilepic.name;
            await req.files.profilepic.mv(profilePath);

            await cloudinary.uploader.upload(profilePath).then(function (picUrlResult) {
                profilepicurl = picUrlResult.url;
                console.log("Profile Uploaded:", profilepicurl);
            });
        }

        let emailid = req.body.inputEmail1;
        let address = req.body.inputAdr;
        let contact = req.body.inputNum;
        let game = req.body.inputGame;
        let otherinfo = req.body.inputinfo;
        let dob = formatDOB(jsondata.dob);

        if (!dob || isNaN(Date.parse(dob))) {
            return resp.send("Invalid date format in Aadhaar: " + jsondata.dob);
        }

        mySqlVen.query(
            "update players set acardpicurl=?, profilepicurl=?, name=?, dob=?, gender=?, address=?, contact=?, game=?, otherinfo=? where emailid=?",
            [acardpicurl, profilepicurl, jsondata.name, dob, jsondata.gender, address, contact, game, otherinfo, emailid],
            function (error, result) {
                if (result.affectedRows > 0)
                    resp.send("Profile updated successfully!");
                else if (result.affectedRows == 0)
                    resp.send("Email not found.");
                else
                    resp.send("Database error: " + error.message);
            }
        );
    } catch (err) {
        console.error("Update error:", err);
        resp.send("Server error: " + err.message);
    }
});
app.get("/get-one1", function (req, resp) {
    let emailid = req.query.emailid;
    console.log("Fetching data for:", emailid);
    mySqlVen.query("select * from players where emailid=?", [emailid], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    });
});
app.get("/check-email", function (req, res) {
    let email = req.query.emailid;
    mySqlVen.query("Select * from users where emailid = ?", [email], function (err, result) {
        if (err) {
            res.status(500).send("Error");
        } else if (result.length === 0) {
            res.send("Not Found");
        } else {
            res.send("Found");
        }
    });
});
app.get("/check-password", function (req, res) {
    let passwords = req.query.passwords;
    mySqlVen.query("Select * from users where passwords = ?", [passwords], function (err, result) {
        if (err) {
            res.status(500).send("Error");
        } else if (result.length === 0) {
            res.send("Not Found");
        } else {
            res.send("Found");
        }
    });
});


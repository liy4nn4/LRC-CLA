import dotenv from 'dotenv';
import express from "express";
import mysql from "mysql2";    
import mysqlPromise from 'mysql2/promise';
import cors from "cors";
import axios from 'axios';
import multer from 'multer'; // This is a tool that helps us upload files (like images or documents) from a form to our server.
import fs, { stat } from 'fs';
import http from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcrypt';
const saltRounds = 10;
import session from 'express-session'
const store = new session.MemoryStore()

dotenv.config();

const dbPromise = mysqlPromise.createConnection({ host: process.env.DB_HOST_LOCAL,
    user: process.env.DB_USER_LOCAL,
    password: process.env.DB_PASSWORD_LOCAL,
    database: process.env.DB_DATABASE_LOCAL, });

const app = express()
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3000','http://localhost:3002'],
    methods: 'GET,POST,PUT,DELETE',
    credentials:true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie:{ maxAge: 24 * 60 * 60 * 1000},
    saveUninitialized: false,
    store
}))

// app.use((req,res,next)=>{
//     console.log(store)
//     next()
// })

// api key for google books
const apikey = process.env.API_KEY;

// connect server to database
// const db = mysql.createConnection({
//     host: 'lrc-cla-lancewrt-dentsys.i.aivencloud.com',
//     user: 'avnadmin',
//     password: 'AVNS_JlmTwrEiTC51YRZliFQ',
//     database: 'defaultdb',
//     port: 21730,
//     ssl: {
//         rejectUnauthorized: true,
//         ca: fs.readFileSync('./ca.pem').toString()
//     }
// });

 const db = mysql.createConnection({
    host: process.env.DB_HOST_LOCAL,
    user: process.env.DB_USER_LOCAL,
    password: process.env.DB_PASSWORD_LOCAL,
    database: process.env.DB_DATABASE_LOCAL,
}); 

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

/* (async () => {
    try {
        const connection = await db.getConnection();
        console.log("Connected to the database!");
        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
})() */

// How we create an HTTP server with React
const server = http.createServer(app);

// Server is a class
const io = new Server(server, {
    cors: {
        // URL for frontend
        origin: ['http://localhost:3000','http://localhost:3002'],
        
    }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    // Listen for an event from the client
    socket.on('newResource', () => {
        console.log('New data inserted');
        io.emit('updateCatalog');
    });
});

/*--------------MULTER------------------------- */

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        return cb(null,"./public/images")
    },
    filename:function(req,file,cb){
        return cb(null,`${Date.now()}_${file.originalname}`)
    }
})

//upload: This is an instance of multer, configured to use the storage we just defined. It's ready to handle file uploads now!
const upload = multer({ storage });

app.post('/file', upload.single('file'), (req, res) => {
    console.log(req.file); // Log the uploaded file details
    const filePath = req.file.path; // Get the file path

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
        }

        // Send the file data as a response
        res.send(data); // This sends the file content to the frontend
        console.log(data)

        // Attempt to unlink (delete) the file after sending the response
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
    });
});

/*-----------SAVE RESOURCE ONLINE-----------*/
app.post('/save', upload.single('file'), async (req, res) => {
    console.log('Saving resource...');
    const mediaType = req.body.mediaType;
    let adviserFname, adviserLname, filePath, imageFile;
    let pub = {};

    // Handle image upload or URL
    try{
        if (req.file) {
            filePath = req.file.path;
            imageFile = fs.readFileSync(filePath); // Read file synchronously
        } else if (req.body.url) {
            const imageUrl = req.body.url;
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            imageFile = response.data;
        }
    
        // initialize variables based on media type
        if(mediaType==='1'){
           pub = {
                pub_id: req.body.publisher_id,
                pub_name: req.body.publisher,
                pub_add: req.body.publisher_address,
                pub_email: req.body.publisher_email,
                pub_phone:req.body.publisher_number,
                pub_web:req.body.publisher_website
            } 
        }else if(mediaType==='4'){
            // split string
            //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
            const adviser = req.body.adviser.split(' ')
            adviserFname = adviser[0];
            adviserLname = adviser[1];
        }
        
        //authors is in string
        const authors = Array.isArray(req.body.authors)
        ? req.body.authors: req.body.authors.split(',');
       
        // Insert resource
        const resourceId = await insertResources(res, req, authors);
    
        if (mediaType === '1') {
            // Handle books
            const pubId = await checkIfPubExist(pub);
            console.log('Publisher ID:', pubId);
            await insertBook(imageFile, req.body.isbn, resourceId, pubId, req.body.topic, res);
        }else if(['2', '3'].includes(mediaType)){
            // insert journal/newsletter in database
            const jn = [
                req.body.volume,
                req.body.issue,
                imageFile,
                resourceId,
                req.body.topic,
            ];

            await insertJournalNewsletter(jn,res,filePath)
        }else{
            //if thesis, after inserting data to authors, resourceauthors, and resources, check if adviser exists. If existing, insert directly to thesis table. if not, insert advisers first then insert to thesis table
            const adviser = [
                adviserFname,
                adviserLname
            ]
            
            //get adviserId
            const adviserID = await checkAdviserIfExist(adviser)
            console.log('adviserId: ',adviserID)
            //insert to thesis table
            await insertThesis(resourceId,adviserID,res)      
        }
    }catch(error){
        console.log(error)
        return res.send(error)
    }
    
})

//check if adviser exist
const checkAdviserIfExist = async (adviser) => {
    const q = "SELECT * FROM adviser WHERE adviser_fname = ? AND adviser_lname = ?";

    return new Promise((resolve, reject) => {
        db.query(q, adviser, async (err, results) => {
            if (err) {
                return reject(err); // Reject the promise on error
            }

            if (results.length > 0) {
                resolve(results[0].adviser_id); // Resolve with existing adviser ID
            } else {
                try {
                    const adviserId = await insertAdviser(adviser); // Call insertAdviser for new adviser
                    resolve(adviserId); // Resolve with new adviser ID
                } catch (insertError) {
                    reject(insertError); // Reject if insertAdviser fails
                }
            }
        });
    });
};

//insert adviser
const insertAdviser = async (adviser) => {
    const q = `INSERT INTO adviser (adviser_fname, adviser_lname) VALUES (?, ?)`;

    return new Promise((resolve, reject) => {
        db.query(q, adviser, (err, results) => {
            if (err) {
                return reject(err); // Reject the promise on error
            }

            resolve(results.insertId); // Resolve with the new adviser ID
        });
    });
};


//insert thesis 
const insertThesis = async (resourceId, adviserId,res)=>{
    const q = "INSERT INTO thesis (resource_id, adviser_id) VALUES (?,?)"

    db.query(q,[resourceId,adviserId],(err,results)=>{
        if (err) {
            return res.status(500).send(err); 
        }

        return res.send({status:201,message:'Thesis inserted successfully.'});
    })
}

//insert journal and newsletter
const insertJournalNewsletter = async(jn,res,filePath)=>{
    const q = 'INSERT INTO journalnewsletter (jn_volume, jn_issue, jn_cover, resource_id,topic_id) VALUES (?, ?, ?, ?,?)';
            
    db.query(q, jn, (err, result) => {
        if (err) {
            return res.status(500).send(err); 
        }
    
        // Cleanup uploaded file
        if (filePath) {
            fs.unlinkSync(filePath);
        }
        return res.send({status: 201, message:'Journal/Newsletter inserted successfully.'});
    });
}

//check if publisher exist 
const checkIfPubExist = async (pub) => {
    if (pub.pub_id == 0 && pub.pub_name == '') {
        return null;
    } else if (pub.pub_id == 0 && pub.pub_name) {
        const pubId = await insertPublisher(pub); 
        return pubId;
    }else if(pub.pub_id>0){
        return pub.pub_id
    }
    console.log(pub);
};

// Updated insertPublisher to return a Promise
const insertPublisher = async (pub) => {
    // First, check if the publisher already exists
    const existingPubId = await new Promise((resolve, reject) => {
        const q = `
        SELECT pub_id FROM publisher 
        WHERE pub_name = ? 
        AND pub_address = ? 
        AND pub_email = ? 
        AND pub_phone = ? 
        AND pub_website = ?`;

        const values = [
            pub.pub_name,
            pub.pub_add,
            pub.pub_email,
            pub.pub_phone,
            pub.pub_web
        ];

        db.query(q, values, (err, results) => {
            if (err) {
                return reject(err); 
            }

            // If publisher exists, resolve with the publisher's ID, else resolve with null
            if (results && results.length > 0) {
                resolve(results[0].pub_id);
            } else {
                resolve(null);
            }
        });
    });

    // If the publisher exists, return the existing pub_id
    if (existingPubId) {
        return existingPubId;
    }

    // Otherwise, insert the publisher and return the new pub_id
    return new Promise((resolve, reject) => {
        const q = `
        INSERT INTO publisher (pub_name, pub_address, pub_email, pub_phone, pub_website) 
        VALUES (?,?,?,?,?)`;

        const values = [
            pub.pub_name,
            pub.pub_add,
            pub.pub_email,
            pub.pub_phone,
            pub.pub_web
        ];

        db.query(q, values, (err, results) => {
            if (err) {
                return reject(err); 
            }

            if (results) {
                const pubId = results.insertId;
                resolve(pubId); // Resolve with the new publisher's ID
            } else {
                reject(new Error('Publisher insert failed')); // Reject if insertion fails
            }
        });
    });
};

//insert book
const insertBook = async(cover, isbn, resourceId, pubId, topic,res)=>{
    const q = `
    INSERT INTO book (book_cover, book_isbn, resource_id, pub_id, topic_id) VALUES (?,?,?,?,?)`

    const values = [
        cover,
        isbn,
        resourceId,
        pubId,
        topic
    ]

    db.query(q, values, (err,results)=>{
        if (err) {
            return res.status(500).send(err); 
        }
        console.log('Book inserted successfully')
        return res.send({status: 201, message:'Book inserted successfully.'});
    })

}

//check resource if exist
const checkResourceIfExist = (title) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM resources WHERE resource_title = ?`;

        db.query(query, [title], (err, results) => {
            if (err) {
                return reject(err); // Reject with error
            }

            if (results.length > 0) {
                // Resolve with `true` if resource exists
                resolve(true);
            } else {
                // Resolve with `false` if resource does not exist
                resolve(false);
            }
        });
    });
};

//insert resource
const insertResources = async (res, req, authors) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if the resource exists
            const resourceExists = await checkResourceIfExist(req.body.title);

            if (resourceExists) {
                console.log('Resource already exists.');
                return reject({ status: 409, message: 'Resource already exists.' });
            }

            // Insert the resource
            const insertQuery = `
                INSERT INTO resources (
                    resource_title, 
                    resource_description, 
                    resource_published_date, 
                    resource_quantity, 
                    resource_is_circulation, 
                    dept_id, 
                    type_id, 
                    avail_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const resourceValues = [
                req.body.title,
                req.body.description,
                req.body.publishedDate,
                req.body.quantity,
                req.body.isCirculation,
                req.body.department,
                req.body.mediaType,
                req.body.status,
            ];

            db.query(insertQuery, resourceValues, async (err, results) => {
                if (err) {
                    return reject(err); // Reject with error
                }

                // Get the `resource_id` of the newly inserted row
                const resourceId = results.insertId;

                try {
                    // Insert authors for the resource
                    await insertAuthors(res, authors, resourceId);
                    resolve(resourceId); // Resolve with the `resourceId`
                } catch (authorError) {
                    reject(authorError); // Reject if there's an error inserting authors
                }
            });
        } catch (error) {
            reject(error); // Reject with any error that occurs
        }
    });
};

//insert authors 
const insertAuthors = async (res,authors,resourceId)=>{
    return new Promise((resolve,reject)=>{
            //insert authors
            const authorQ = 'INSERT INTO author (author_fname, author_lname) VALUES (?, ?)' 
            const resourceAuthorQ = 'INSERT INTO resourceauthors (resource_id, author_id) VALUES (?, ?)'
            const checkIfAuthorExist ='SELECT author_id FROM author WHERE author_fname = ? AND author_lname = ?'

            authors.forEach(element => {          
                    const nameParts = element.split(' '); 
                    const fname = nameParts.slice(0, -1).join(" "); // "John Michael"
                    const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''; // "Doe"
                    const authorValue = [
                        fname,
                        lname
                    ]

                    // check if author already exist
                    db.query(checkIfAuthorExist,[fname,lname], (err,results)=>{
                        if (err) {
                            return res.status(500).send(err); 
                        }
                        
                        //pag walang nahanap, new author sa authors table
                        if(results.length===0){
                            db.query(authorQ,authorValue,(err,results)=>{
                                if (err) {
                                    return res.status(500).send(err); 
                                }
                
                                //authorId nung author info na kakainsert lang
                                const authorId = results.insertId;
                
                                //if author is inserted, insert sa resourceAuthor table
                                db.query(resourceAuthorQ,[resourceId,authorId],(req,res)=>{
                                    if (err) {
                                        return res.status(500).send(err); 
                                    }
    
                                    resolve() 
                                })
                            })
                        }else{
                            //if author is inserted, insert sa resourceAuthor table
                            //results look like this: 
                            // [
                            //     {
                            //         author_id: 5
                            //     }
                            // ]
                            //so you have to use index to access id
                            db.query(resourceAuthorQ,[resourceId,results[0].author_id],(req,res)=>{
                                if (err) {
                                    return res.status(500).send(err); 
                                }
                                resolve() 
                            })
                        }
                    })    
                });
           
    })
}

/*-----------EDIT RESOURCE ONLINE-----------*/
app.put('/file', upload.single('file'), (req, res) => {
    console.log(req.file); // Log the uploaded file details
    const filePath = req.file.path; // Get the file path

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
        }

        // Send the file data as a response
        res.send(data); // This sends the file content to the frontend
        console.log(data)

        // Attempt to unlink (delete) the file after sending the response
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
    });
});
app.put('/edit/:id', upload.single('file'),async (req, res) => {
    const resourceId = req.params.id;
    const mediaType = req.body.mediaType;
    let adviserFname, adviserLname, filePath, imageFile;
    let pub = {};
    
    try{
        if(req.file){
            filePath = req.file.path; // Get the file path 
            fs.readFile(filePath, (err, data) => {
                 if (err) {
                     return res.status(500).send(err); 
                 }
                 imageFile = data;
             })
         }

         // initialize variables based on media type
        if(mediaType==='1'){
            pub = {
                 pub_id: req.body.publisher_id,
                 pub_name: req.body.publisher,
                 pub_add: req.body.publisher_address,
                 pub_email: req.body.publisher_email,
                 pub_phone:req.body.publisher_number,
                 pub_web:req.body.publisher_website
             } 
         }else if(mediaType==='4'){
             // split string
             //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
             const adviser = req.body.adviser.split(' ')
             adviserFname = adviser[0];
             adviserLname = adviser[1];
         }
         
         const authors = req.body.authors.split(',')

         //edit resource
         await editResource(res,req,authors,resourceId)

         if (mediaType === '1') {
            //  check if publisher exist 
            //check publisher if exist
            const pubId = await checkIfPubExist(pub)
            console.log('pubId: ', pubId)
            editBook(imageFile,req.body.isbn,resourceId,pubId,req.body.topic,res,filePath)
        }else if(mediaType==='2'|| mediaType==='3'){
            await editJournalNewsletter(filePath,res,req.body.volume,req.body.issue,imageFile,resourceId)
        }else{
            const adviser = [
                adviserFname,
                adviserLname
            ]
            
            //get adviserId
            const adviserId = await checkAdviserIfExist(adviser)
            //update thesis    
            await editThesis([adviserId,resourceId],res)
        }
    }catch(error){
        console.log(error)
        return res.send(error)
    }
})
//edit book
const editBook = async (cover, isbn, resourceId, pubId, topic,res,filePath)=>{
    let q;
    let book;

    console.log('filepath: ', filePath)

    if (typeof filePath === 'string') {
        q = `UPDATE book SET book_cover = ?, book_isbn = ?, pub_id = ?, topic_id = ? WHERE resource_id = ?`;
        book = [cover, isbn, pubId, topic, resourceId];
    } else {
        q = `UPDATE book SET book_isbn = ?, pub_id = ?, topic_id = ? WHERE resource_id = ?`;
        book = [isbn, pubId, topic, resourceId];
    }
    

    db.query(q, book, (err, result) => {
        if (err) {
            return res.status(500).send(err); 
        }
        if(typeof filePath === 'string'){
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting file:', unlinkErr);
            }); 
        }
        console.log('Book edited successfully')
        // Successfully inserted 
        return res.send({status: 201, message:'Book edited successfully.'});
    });
}
//edit journal/newsletter
const editJournalNewsletter = async(filePath,res,volume,issue,cover,resourceId)=>{
    let q;
    let jn;

    if(typeof filePath === 'string'){
        q = `
             UPDATE 
                journalnewsletter 
            SET
                jn_volume = ?,
                jn_issue = ?,
                jn_cover = ?
                WHERE
                resource_id = ?`;
        jn = [
                volume,
                issue,
                cover,
                resourceId
        ]
        }else{
        q = `
            UPDATE
                journalnewsletter 
            SET
                jn_volume = ?,
                jn_issue = ?
                WHERE
                resource_id = ?`;
            jn = [
                volume,
                issue,
                resourceId
            ]
        }
                
        db.query(q, jn, (err, result) => {
            if (err) {
                return res.status(500).send(err); 
            }

            if(typeof filePath === 'string'){
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                }); 
            }

            return res.send({status:201,message:'Journal/Newsletter edited successfully.'});
        });
}
//edit resource
const editResource = async (res,req,authors,resourceId)=>{
    return new Promise((resolve,reject)=>{
        const q = `
        UPDATE
            resources
        SET 
            resource_title = ?,
            resource_description = ?,
            resource_published_date = ?,
            resource_quantity = ?,
            resource_is_circulation = ?,
            dept_id = ?,
            type_id = ?,
            avail_id = ?
        WHERE 
            resource_id = ?
            `;

        const resources = [
            req.body.title,
            req.body.description,
            req.body.publishedDate,
            req.body.quantity,
            req.body.isCirculation,
            req.body.department,
            req.body.mediaType,
            req.body.status,
            resourceId
        ];

        console.log(resources)

        db.query(q, resources,(err, results)=>{
            if (err) {
                return res.status(500).send(err); 
            }

            editAuthors(res,authors,resourceId).then(()=>{
                resolve('success')
            })
            // resolve('success')
        })
    })
}
//edit thesis
const editThesis = async (values,res)=>{
    const q = `UPDATE thesis SET adviser_id = ? WHERE
    resource_id = ?`

    db.query(q, values, (err,results)=>{
        if (err) {
            return res.status(500).send(err); 
        }

        res.send({status:201, message:'Thesis edited successfully.'})
    })
}
//insert authors 
const editAuthors = async (res,authors,resourceId)=>{
    return new Promise((resolve,reject)=>{
        //delete first yung record ng given resource_id sa resource_authors
        const deleteResourceAuthorsQ = 'DELETE FROM resourceauthors WHERE resource_id = ?'

        db.query(deleteResourceAuthorsQ,[resourceId],(err,result)=>{
            if (err) {
                return res.status(500).send(err); 
            }

            //insert authors
            const authorQ = 'INSERT INTO author (author_fname, author_lname) VALUES (?, ?)' 
            const resourceAuthorQ = 'INSERT INTO resourceauthors (resource_id, author_id) VALUES (?, ?)'
            const checkIfAuthorExist ='SELECT author_id FROM author WHERE author_fname = ? AND author_lname = ?'

            authors.forEach(element => {
                const nameParts = element.split(' '); 
                const fname = nameParts.slice(0, -1).join(" "); // "John Michael"
                const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''; // "Doe"
                const authorValue = [
                    fname,
                    lname
                ]

                // check if author already exist
                db.query(checkIfAuthorExist,[fname,lname], (err,results)=>{
                    if (err) {
                        return res.status(500).send(err); 
                    }
                    
                    //pag walang nahanap, insert new author sa authors table
                    if(results.length===0){
                        db.query(authorQ,authorValue,(err,results)=>{
                            if (err) {
                                return res.status(500).send(err); 
                            }
            
                            //authorId nung author info na kakainsert lang
                            const authorId = results.insertId;
            
                            //if author is inserted, insert sa resourceAuthor table
                            db.query(resourceAuthorQ,[resourceId,authorId],(req,res)=>{
                                if (err) {
                                    return res.status(500).send(err); 
                                }

                                resolve() 
                            })
                        })
                    }else{
                        //if author is inserted, insert sa resourceAuthor table
                        //results look like this: 
                        // [
                        //     {
                        //         author_id: 5
                        //     }
                        // ]
                        //so you have to use index to access id
                        db.query(resourceAuthorQ,[resourceId,results[0].author_id],(req,res)=>{
                            if (err) {
                                return res.status(500).send(err); 
                            }
                            resolve() 
                        })
                    }
                })    
            });

        })
        
    })
}

/*-----------RETRIEVE BOOK ISBN-----------*/
// retrieve book information from google books api using isbn
app.get('/bookData/:isbn',async (req,res)=>{
    const isbn = req.params.isbn
    try{
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apikey}`);
        console.log(response.data)
        return res.json(response.data);
        
    }catch(err){
        console.log(err)
        return res.status(500).json({ message: 'Error fetching data from Google Books API.' });
    }
})

/*-----------RETRIEVE DATA-----------*/
//retrieve list of department from database
app.get('/departments',(req,res)=>{
    const q = 'SELECT * FROM department'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
})
app.get('/topic',(req,res)=>{
    const q = 'SELECT * FROM topic'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
})
// retrieve list of genre from database
app.get('/publishers',(req,res)=>{
    const q = 'SELECT * FROM publisher'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
})
//retrieve list of genre from database
app.get('/authors',(req,res)=>{
    const q = 'SELECT * FROM author'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
})
//retrieve advisers  from database
app.get('/advisers',(req,res)=>{
    const q = 'SELECT * FROM adviser'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
})
//retrieve type  from database
app.get('/type',(req,res)=>{
    const q = 'SELECT * FROM resourcetype'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
})
//retrieve type  from database
app.get('/status',(req,res)=>{
    const q = 'SELECT * FROM availability'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
})

app.get('/roles', (req,res)=>{
    const q = 'SELECT * FROM roles'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
})

app.get("/getTotalVisitors", (req, res) => {
    const { date } = req.query;
  
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
  
    const query = `SELECT COUNT(*) AS total_attendance FROM attendance WHERE DATE(att_date) = ?`;
  
    db.query(query, [date], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
  
      const total_attendance = result[0]?.total_attendance || 0;
      res.json({ total_attendance });
    });
  });

app.get("/getBorrowedBooks", (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: "Date is required" });
    }

    const query = `SELECT COUNT(*) AS total_borrowed FROM checkout WHERE DATE(checkout_date) = ?`;

    db.query(query, [date], (err, result) => {
        if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
        }

        const total_borrowed = result[0]?.total_borrowed || 0;
        res.json({ total_borrowed });
    });
});



/*-------DISPLAY DATA FOR CATALOG PAGE & DYNAMIC SEARCH----- */
app.get('/catalogdetails', (req, res) => {
    const keyword = req.query.keyword || '';
    const offset = parseInt(req.query.offset, 10);
    const type = parseInt(req.query.type);
    const topic = parseInt(req.query.topic);
    const department = parseInt(req.query.department);
    const author = parseInt(req.query.author)
    const title = parseInt(req.query.title);

    if (isNaN(offset)) {
        res.status(400).send('Invalid offset value');
        return;
    }
    const searchKeyword = `%${keyword}%`;
    let orderClauses = '';
    
    // Handle sorting by title
    if (title) {
        if (title == '1') {
            orderClauses='ORDER BY resources.resource_title ASC';
        } else if (title == '2') {
            orderClauses='ORDER BY resources.resource_title DESC';
        }
    }
    
    // Handle sorting by author
    if (author) {
        if (author == '1') {
            orderClauses='ORDER BY author.author_fname ASC';
        } else if (author == '2') {
            orderClauses='ORDER BY author.author_fname DESC';
        }
    }
   
    const params1 = [searchKeyword, searchKeyword, searchKeyword];

    const q = `
        SELECT DISTINCT resources.resource_id
        FROM resources
        JOIN resourceauthors ON resources.resource_id = resourceauthors.resource_id
        JOIN author ON resourceauthors.author_id = author.author_id
        WHERE resources.resource_title LIKE ?
           OR author.author_fname LIKE ?
           OR author.author_lname LIKE ?
        ${orderClauses}
        LIMIT 5 OFFSET ?;`;

    let whereClauses = [`resources.resource_id = ?`]
    
    let orderAuthor = ''
    if(type>0){
        whereClauses.push(`resources.type_id = ${type}`)
    }
    if(department>0){
        whereClauses.push(`resources.dept_id = ${department}`)
    }
    if(topic>0){
        whereClauses.push(`book.topic_id = ${topic} OR journalnewsletter.topic_id = ${topic}`)
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    let countWhereClauses = whereClauses.shift()
    const countWhereClause = countWhereClauses>0?`WHERE ${whereClauses.join(' AND ')}` : ''
    


    const resourceInfoQ = `
        SELECT 
            resources.resource_title, 
            resources.resource_id, 
            resourcetype.type_name, 
            resources.resource_quantity, 
            department.dept_name,
            CASE
                WHEN resources.type_id IN ('1', '2', '3') THEN topic.topic_name
                ELSE 'n/a'
            END AS topic_name,
            GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names
        FROM resources
        JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id 
        JOIN author ON resourceauthors.author_id = author.author_id 
        JOIN resourcetype ON resources.type_id = resourcetype.type_id 
        JOIN department ON department.dept_id = resources.dept_id
        LEFT JOIN book ON resources.resource_id = book.resource_id
        LEFT JOIN journalnewsletter ON resources.resource_id = journalnewsletter.resource_id
        LEFT JOIN topic 
            ON (book.topic_id = topic.topic_id OR journalnewsletter.topic_id = topic.topic_id)
        ${whereClause}
        GROUP BY resources.resource_id;`;

        console.log(resourceInfoQ)
        
        const countQ = `
            SELECT COUNT(DISTINCT resources.resource_id) AS total
            FROM resources
            JOIN resourceauthors ON resources.resource_id = resourceauthors.resource_id
            JOIN author ON resourceauthors.author_id = author.author_id
            LEFT JOIN book ON resources.resource_id = book.resource_id
            LEFT JOIN journalnewsletter ON resources.resource_id = journalnewsletter.resource_id
            LEFT JOIN topic ON book.topic_id = topic.topic_id OR journalnewsletter.topic_id = topic.topic_id
            WHERE resources.resource_title LIKE ? 
            OR author.author_fname LIKE ? 
            OR author.author_lname LIKE ?
            ${countWhereClause};`;
    
            console.log(countQ)

    db.query(countQ, params1, (err, countResult) => {
        if (err) {
            console.error('Error counting resources:', err);
            return res.status(500).send('An internal server error occurred.');
        }

        const totalResource = countResult[0]?.total || 0;

        db.query(q, [...params1, offset], (err, result) => {
            if (err) {
                console.error('Error fetching resource IDs:', err);
                return res.status(500).send('An internal server error occurred.');
            }

            if (result.length > 0) {
                const resourceIds = result.map(res => res.resource_id);
                const resourcePromises = resourceIds.map(id =>
                    new Promise((resolve, reject) => {
                        db.query(resourceInfoQ, [id], (err, resourceResult) => {
                            if (err) return reject(err);
                            resolve(resourceResult[0] || null);
                        });
                    })
                );

                Promise.all(resourcePromises)
                    .then(resources => {
                        const validResources = resources.filter(r => r !== null);
                        res.send({ validResources, totalResource });
                    })
                    .catch(err => {
                        console.error('Error fetching resource details:', err);
                        res.status(500).send('An internal server error occurred.');
                    });
            } else {
                res.send({ validResources: [], totalResource });
            }
        });
    });
});


/*--------VIEW RESOURCE FROM CATALOG-------------*/ 
app.get('/view/:id',(req,res)=>{
    const id = req.params.id;

    // check first the type so i know where to store them
    const q = "SELECT resourcetype.type_name FROM resourcetype JOIN resources ON resources.type_id = resourcetype.type_id WHERE resources.resource_id = ?"

    db.query(q,[id],(err,results)=>{
        if(err) return res.send(err)

        if (!results.length) {
            return res.status(404).send({ error: "Resource not found" });
        }
        
        console.log(results[0].type_name)
        //store type name here
        const resourceType = results[0].type_name   

        switch(resourceType){
            case 'book':
                getBookResource(id,res);
                break;
            case 'journal':
            case 'newsletter':
                getNewsletterJournalResource(id,res);
                break;
            case 'thesis':
                getThesisResource(id,res);
                break;
            default:
                return res.status(404).send({ error: `Unsupported resource type: ${resourceType}` });
        }
    })
}) 
const getBookResource = (id,res)=>{
    const q = `
    SELECT 
        resources.resource_id, 
        resources.type_id, 
        GROUP_CONCAT(DISTINCT CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names, 
        resources.dept_id, 
        resources.avail_id, 
        resources.resource_description, 
        resources.resource_is_circulation, 
        book.book_isbn, 
        resources.resource_published_date,
        book.pub_id, 
        resources.resource_quantity, 
        resources.resource_title, 
        publisher.pub_name,
        book.book_cover,
		book.topic_id 
    FROM resources 
    JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id 
    JOIN author ON resourceauthors.author_id = author.author_id 
    JOIN resourcetype ON resources.type_id = resourcetype.type_id 
    LEFT JOIN book ON book.resource_id = resources.resource_id 
    LEFT JOIN publisher ON book.pub_id = publisher.pub_id 
    WHERE resources.resource_id = ?
    GROUP BY  resources.resource_id`

    db.query(q,[id],(err,result)=>{
        if(err) return res.send(err)
            console.log(result[0])
        return res.json(result)
    })
}
const getNewsletterJournalResource = (id,res)=>{
    const q = 
    `SELECT 
        resources.resource_id,
        resources.type_id,
        resources.resource_quantity,
        resources.avail_id,
        resources.resource_title,
        resources.resource_published_date,
        resources.resource_description,
        resources.dept_id,
        journalnewsletter.topic_id,
        resources.resource_is_circulation,
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names,
        journalnewsletter.jn_volume,
        journalnewsletter.jn_issue,
        journalnewsletter.jn_cover
    FROM resources
    JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id
    JOIN author ON resourceauthors.author_id = author.author_id
    JOIN resourcetype ON resourcetype.type_id = resources.type_id
    JOIN journalnewsletter ON resources.resource_id = journalnewsletter.resource_id
    WHERE resources.resource_id = ?
    GROUP BY resources.resource_id`

    db.query(q,[id],(err,result)=>{
        if(err) return res.send(err)
        console.log(result[0])
        return res.json(result)
    })
}

const getThesisResource = (id,res)=>{
    const q = 
    `SELECT
        resources.type_id,
        resources.dept_id,
        resources.resource_description,
        resources.resource_is_circulation,
        resources.resource_published_date,
        resources.resource_quantity,
        resources.avail_id,
        resources.resource_title,
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names,
        CONCAT(adviser.adviser_fname, ' ', adviser.adviser_lname) AS adviser_name
    FROM resources
    JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id
    JOIN author ON resourceauthors.author_id = author.author_id
    JOIN resourcetype ON resources.type_id = resourcetype.type_id
    JOIN thesis ON resources.resource_id = thesis.resource_id
    JOIN adviser ON adviser.adviser_id = thesis.adviser_id
    WHERE resources.resource_id = ?
    GROUP BY resources.resource_id`

    db.query(q,[id],(err,result)=>{
        if(err) return res.send(err)
        console.log(result[0])
        return res.json(result)
    })
}

/*--------------SEARCH IN ONLINE CATALOG-------------------*/
app.get('/resource/search', async (req, res) => {
    const searchQuery = req.query.q;
    const searchFilter = req.query.filter;
    console.log(searchQuery);
    console.log(searchFilter)

    const query = 
    `SELECT 
        resource_Id 
    FROM 
        resources 
    WHERE 
        resource_title 
    LIKE ?`;

    db.query(query, [`%${searchQuery}%`], async (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length !== 0) {
            const searchResults = [];

            const titleAuthorQuery = `
                SELECT 
                    resources.resource_title, 
                    resources.resource_id,
                    book.book_cover, 
                    CONCAT(author.author_fname, ' ', author.author_lname) AS author_name 
                FROM resourceauthors 
                JOIN resources ON resourceauthors.resource_id = resources.resource_id 
                JOIN author ON resourceauthors.author_id = author.author_id 
                JOIN book ON book.resource_id = resources.resource_id 
                WHERE resourceauthors.resource_id = ?`;

            try {
                await Promise.all(
                    results.map(item => {
                        return new Promise((resolve, reject) => {
                            db.query(titleAuthorQuery, [item.resource_Id], (err, results) => {
                                if (err) return reject(err); // Reject on query error

                                if (results.length > 0) {
                                    searchResults.push({
                                        title: results[0].resource_title,
                                        author: results[0].author_name,
                                        cover: results[0].book_cover,
                                        id: results[0].resource_id
                                    });
                                }
                                resolve(); // Resolve the promise
                            });
                        });
                    })
                );

                console.log(searchResults);
                res.json(searchResults); // Send the collected results
            } catch (err) {
                res.status(500).send(err); // Handle errors in the inner queries
            }
        } else {
            res.send([]); // No results found
        }
    });
});
app.get('/resource/:id', (req,res)=>{
    const id = req.params.id;
    
    const q = "SELECT resources.resource_title,resources.resource_description, CONCAT(author.author_fname, ' ', author.author_lname) AS author_name, availability.avail_name, catalog.cat_course_code, book.book_cover, book.book_isbn FROM resourceauthors JOIN resources ON resourceauthors.resource_id = resources.resource_id JOIN author ON resourceauthors.author_id = author.author_id JOIN book ON book.resource_id = resources.resource_id AND resources.resource_id = book.resource_id JOIN availability ON resources.avail_id = availability.avail_id JOIN catalog ON resources.cat_id = catalog.cat_id WHERE resourceauthors.resource_id=?;"

    db.query(q,[id],(err,result)=>{
        if(err) return res.send(err)
            return res.json(result)
    })
})



app.get('/patron', (req, res) => {


const q = `SELECT 
            p.patron_id,
            p.tup_id,
            p.patron_fname,
            p.patron_lname,
            p.patron_email,
            p.category,
            cr.course_name,
            COUNT(CASE WHEN c.status = 'borrowed' THEN 1 END) AS total_checkouts
        FROM 
            patron p
        LEFT JOIN 
            checkout c ON p.patron_id = c.patron_id
        LEFT JOIN 
            course cr ON p.course_id = cr.course_id
        GROUP BY 
            p.tup_id, 
            p.patron_fname, 
            p.patron_lname, 
            p.patron_email, 
            p.category, 
            cr.course_name;

`;

db.query(q, (err, results) => {
    if (err) {
    res.send(err);
    } else if (results.length > 0) {
    res.json(results);
    } else {
    res.json({ message: 'No patrons found' });
    }
});
});

app.get('/patronCheckin', (req, res) => {


    const q = `SELECT 
                    p.patron_id,
                    p.tup_id,
                    p.patron_fname,
                    p.patron_lname,
                    p.patron_email,
                    p.category,
                    cr.course_name,
                    COUNT(c.checkout_id) AS total_checkouts
                FROM 
                    patron p
                LEFT JOIN 
                    checkout c 
                ON 
                    p.patron_id = c.patron_id AND c.status = 'borrowed'
                LEFT JOIN 
                    course cr
                ON 
                    p.course_id = cr.course_id
                GROUP BY 
                    p.tup_id, 
                    p.patron_fname, 
                    p.patron_lname, 
                    p.patron_email, 
                    p.category, 
                    cr.course_name
                HAVING 
                    COUNT(c.checkout_id) > 0;
    `;
    
    db.query(q, (err, results) => {
        if (err) {
        res.send(err);
        } else if (results.length > 0) {
        res.json(results);
        } else {
        res.json({ message: 'No patrons found' });
        }
    });
    });

app.get('/getBorrowers', (req, res) => {
    const q = `SELECT 
            p.tup_id, 
            p.patron_fname, 
            p.patron_lname, 
            p.patron_email, 
            p.category, 
            GROUP_CONCAT(r.resource_title ORDER BY r.resource_title SEPARATOR ', \n') AS borrowed_books,
            course.course_name AS course, 
            COUNT(c.checkout_id) AS total_checkouts
        FROM 
            patron p
        INNER JOIN 
            checkout c ON p.patron_id = c.patron_id
        INNER JOIN 
            resources r ON c.resource_id = r.resource_id
        JOIN 
            course ON p.course_id = course.course_id
        GROUP BY 
            p.tup_id, 
            p.patron_fname, 
            p.patron_lname, 
            p.patron_email, 
            p.category, 
            course.course_name
        ORDER BY 
            MAX(c.checkout_date) DESC
        LIMIT 5;
`;

    db.query(q, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Database error', details: err.message });
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'No patrons with checkouts found' });
        }
    });
});

app.get('/api/books/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      console.log('Incoming query:', req.query);
    try {
      const [results] = await (await dbPromise).execute(
        `
        SELECT 
            b.book_isbn, 
            b.book_cover,
            r.resource_title AS title, 
            r.resource_quantity AS quantity, 
            r.resource_id
        FROM 
            book b
        INNER JOIN 
            resources r 
        ON 
            b.resource_id = r.resource_id
        WHERE 
            b.book_isbn LIKE ? OR r.resource_title LIKE ?
        LIMIT 10;
        `,
        [`%${query}%`, `%${query}%`]
      );
      
      const covers = results.map(book => ({
        cover: Buffer.from(book.book_cover).toString('base64'),
        resource_id: (book.resource_id),
        resource_title: (book.title),
        resource_quantity: (book.quantity),
        book_isbn: (book.book_isbn)

    }));

      res.json(covers);
    } catch (error) {
      console.error('Error fetching book suggestions:', error);
      res.status(500).send("Error fetching book suggestions");
    }
  });

  app.get('/api/books/search/checkin', async (req, res) => {
    const { query, patron_id } = req.query; // Assuming patron_id is passed as a query parameter

    // Validate query and patron_id
    if (!query || !patron_id) {
        return res.status(400).json({ error: 'Both query and patron_id parameters are required' });
    }
    
    console.log('Incoming query:', req.query);

    try {
        const [results] = await (await dbPromise).execute(
            `
            SELECT 
                b.book_isbn, 
                b.book_cover,
                r.resource_title AS title, 
                r.resource_quantity AS quantity, 
                r.resource_id
            FROM 
                book b
            INNER JOIN 
                resources r 
            ON 
                b.resource_id = r.resource_id
            WHERE 
                (b.book_isbn LIKE ? OR r.resource_title LIKE ?)
                AND r.patron_id = ?
            LIMIT 10;
            `,
            [`%${query}%`, `%${query}%`, `%${patron_id}%`]
        );

        const covers = results.map(book => ({
            cover: book.book_cover
                ? Buffer.from(book.book_cover).toString('base64')
                : null, // Handle potential null covers
            resource_id: book.resource_id,
            resource_title: book.title,
            resource_quantity: book.quantity,
            book_isbn: book.book_isbn,
        }));

        res.json(covers);
    } catch (error) {
        console.error('Error fetching book suggestions:', error);
        res.status(500).send("Error fetching book suggestions");
    }
});

app.get('/api/books/search/checkin2', async (req, res) => {
    const { query, patron_id } = req.query;

    // Validate query and patron_id
    if (!query || !patron_id) {
        return res.status(400).json({ error: 'Both query and patron_id parameters are required' });
    }

    console.log('Incoming query:', req.query);

    try {
        const [results] = await (await dbPromise).execute(
            `
            SELECT 
                b.book_isbn, 
                b.book_cover,
                r.resource_title AS title, 
                r.resource_id
            FROM 
                book b
            INNER JOIN 
                resources r 
            ON 
                b.resource_id = r.resource_id
            INNER JOIN 
                checkout c 
            ON 
                r.resource_id = c.resource_id
            WHERE 
                (b.book_isbn LIKE ? OR r.resource_title LIKE ?)
                AND c.patron_id = ? AND c.status = "borrowed"

            LIMIT 10;
            `,
            [`%${query}%`, `%${query}%`, patron_id]
        );

        const covers = results.map(book => ({
            cover: book.book_cover
                ? Buffer.from(book.book_cover).toString('base64')
                : null, // Handle potential null book covers
            resource_id: book.resource_id,
            resource_title: book.title,
            book_isbn: book.book_isbn,
        }));

        res.json(covers);
    } catch (error) {
        console.error('Error fetching book suggestions:', error);
        res.status(500).send("Error fetching book suggestions");
    }
});

app.get('/checkoutPatron', async (req, res) => {
const { id } = req.query;

if (!id) {
    return res.status(400).json({ message: 'Missing id parameter' });
}

const query = `
    SELECT 
        patron.patron_id, 
        patron.tup_id, 
        patron.patron_fname, 
        patron.patron_lname, 
        patron.patron_sex, 
        patron.patron_mobile,
        patron.patron_email, 
        course.course_name AS course, 
        college.college_name AS college 
    FROM patron 
    JOIN course ON patron.course_id = course.course_id 
    JOIN college ON patron.college_id = college.college_id 
    WHERE patron.patron_id = ?;
`;

try {
    const [results] = await (await dbPromise).execute(query, [id]);
    if (results.length === 0) {
    return res.status(404).json({ message: 'Patron not found' });
    }
    res.status(200).json([results[0]]);
} catch (error) {
    res.status(500).json({ message: 'Server error', error });
}
});

app.post('/checkout', async (req, res) => {
    const { checkout_date, checkout_due, resource_id, patron_id } = req.body;
    if (!checkout_date || !checkout_due || !resource_id || !patron_id) {
        return res.status(400).json({
          error: 'Invalid input. All fields (checkout_date, checkout_due, resource_id, patron_id) are required.',
        });
      }
    try {
      const result = await (await dbPromise).query(
        'INSERT INTO checkout (checkout_date, checkout_due, resource_id, patron_id) VALUES (?, ?, ?, ?)',
        [checkout_date, checkout_due, resource_id, patron_id]
      );
      res.status(200).json({ message: 'Checkout successful!', checkout_id: result.insertId });
    } catch (error) {
      console.error('Error inserting checkout:', error.message);
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  });

  app.get('/getCheckoutRecord', (req, res) => {
    const { resource_id, patron_id } = req.query;
    const query = 'SELECT checkout_id FROM checkout WHERE resource_id = ? AND patron_id = ?';
  
    db.query(query, [resource_id, patron_id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Checkout record not found.' });
      }
      res.json(results[0]);
    });
  });
  
  // Check In (insert records into the checkin table)
// Check In (insert records into the checkin table and delete from checkout)
app.post('/checkin', (req, res) => {
    const { checkout_id, returned_date } = req.body;
  
    if (!checkout_id || !returned_date) {
      return res.status(400).json({ error: 'checkout_id and returned_date are required.' });
    }
  
    db.beginTransaction((err) => {
      if (err) {
        console.error('Transaction Start Error:', err);
        return res.status(500).json({ error: 'Failed to start transaction.' });
      }
  
      // Insert into the checkin table
      const checkinQuery = 'INSERT INTO checkin (checkout_id, checkin_date) VALUES (?, ?)';
      db.query(checkinQuery, [checkout_id, returned_date], (err, results) => {
        if (err) {
          console.error('Checkin Insert Error:', err);
          return db.rollback(() => {
            res.status(500).json({ error: 'Failed to insert into checkin table.' });
          });
        }
  
        // Delete from checkout table
        const updateCheckoutStatusQuery = 'UPDATE checkout SET status = ? WHERE checkout_id = ?';
        db.query(updateCheckoutStatusQuery, ['returned', checkout_id], (err, results) => {
        if (err) {
            console.error('Update Checkout Status Error:', err);
            return db.rollback(() => {
            res.status(500).json({ error: 'Failed to update checkout status.' });
            });
        }
  
          // Commit the transaction
          db.commit((err) => {
            if (err) {
              console.error('Transaction Commit Error:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Transaction commit failed.' });
              });
            }
  
            res.status(201).json({ message: 'Item successfully checked in and removed from checkout.' });
          });
        });
      });
    });
  });
  

app.get('/getCirculation1', (req, res) => {
    const q = `SELECT 
            p.tup_id, 
            p.patron_fname, 
            p.patron_lname, 
            p.patron_email, 
            p.category, 
            c.checkout_date,
            c.status,
            c.checkout_due,
            GROUP_CONCAT(r.resource_title ORDER BY r.resource_title SEPARATOR ', \n') AS borrowed_books,
            course.course_name AS course, 
            COUNT(c.patron_id) AS total_checkouts
        FROM 
            patron p
        INNER JOIN 
            checkout c ON p.patron_id = c.patron_id
        INNER JOIN 
            resources r ON c.resource_id = r.resource_id
        JOIN 
            course ON p.course_id = course.course_id
        GROUP BY 
            p.tup_id, 
            p.patron_fname, 
            p.patron_lname, 
            p.patron_email, 
            p.category, 
            course.course_name
        ORDER BY 
            MAX(c.checkout_date) DESC;
`;
    db.query(q, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Database error', details: err.message });
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'No patrons with checkouts found' });
        }
    });
});

app.get('/getCirculation', (req, res) => {
    const q = `SELECT 
                p.tup_id, 
                p.patron_fname, 
                p.patron_lname, 
                p.patron_email, 
                p.category, 
                c.checkout_date,
                c.status,
                c.checkout_due,
                GROUP_CONCAT(r.resource_title ORDER BY r.resource_title SEPARATOR ', \n') AS borrowed_books,
                course.course_name AS course, 
                COUNT(c.patron_id) AS total_checkouts,
                CASE 
                    WHEN c.status = 'borrowed' THEN 'Currently Borrowed'
                    WHEN c.status = 'returned' THEN 'Returned'
                    ELSE 'Other'
                END AS status_category
            FROM 
                patron p
            INNER JOIN 
                checkout c ON p.patron_id = c.patron_id
            INNER JOIN 
                resources r ON c.resource_id = r.resource_id
            JOIN 
                course ON p.course_id = course.course_id
            GROUP BY 
                status_category,
                p.tup_id, 
                p.patron_fname, 
                p.patron_lname, 
                p.patron_email, 
                p.category, 
                course.course_name
            ORDER BY 
                status_category, 
                MAX(c.checkout_date) DESC;

            `;
    db.query(q, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Database error', details: err.message });
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'No patrons with checkouts found' });
        }
    });
});

app.get('/getAddedBooks', (req, res) => {
    const q = `SELECT 
    r.resource_id, 
    r.resource_title, 
    r.resource_quantity, 
    GROUP_CONCAT(CONCAT(a.author_fname, ' ', a.author_lname) ORDER BY a.author_lname SEPARATOR ', ') AS authors
    FROM 
        resources AS r
    JOIN 
        resourceauthors AS ra ON r.resource_id = ra.resource_id
    JOIN 
        author AS a ON ra.author_id = a.author_id
    GROUP BY 
        r.resource_id, r.resource_title, r.resource_quantity
    ORDER BY 
        r.resource_id DESC LIMIT 5;
`;

    db.query(q, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'Database error', details: err.message });
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'No patrons with checkouts found' });
        }
    });
});


/* app.get('/patronSort', (req, res) => {
    const { search, startDate, endDate, limit } = req.query;
    
    // Base query with JOINs
    let q = `
        SELECT 
            patron.patron_id, 
            patron.tup_id, 
            patron.patron_fname, 
            patron.patron_lname, 
            patron.patron_sex, 
            patron.patron_mobile,
            patron.patron_email, 
            course.course_name AS course, 
            college.college_name AS college, 
            DATE(attendance.att_date) AS att_date, 
            attendance.att_log_in_time 
        FROM patron 
        JOIN course ON patron.course_id = course.course_id 
        JOIN college ON patron.college_id = college.college_id 
        JOIN attendance ON patron.patron_id = attendance.patron_id 
        WHERE 1=1
    `;

    const params = [];

    // Add search filter if provided
    if (search) {
        q += ` AND (patron.tup_id LIKE ? OR patron.patron_fname LIKE ? OR patron.patron_lname LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add date range filter if provided
    if (startDate) {
        q += ` AND DATE(attendance.att_date) >= ?`;
        params.push(startDate);
    }

    if (endDate) {
        q += ` AND DATE(attendance.att_date) <= ?`;
        params.push(endDate);
    }

    // Add ordering
    q += ` ORDER BY att_date DESC, att_log_in_time DESC`;

    // Add limit for pagination
    if (limit) {
        q += ` LIMIT ?`;
        params.push(parseInt(limit));
    }

    // Execute query
    db.query(q, params, (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Database error: ' + err.message);
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'No patrons found' });
        }
    })
})  */

    /* app.get('/patronSort', (req, res) => {
        const { search, startDate, endDate, limit, page } = req.query;
    
        let q = `
            SELECT 
                patron.patron_id, 
                patron.tup_id, 
                patron.patron_fname, 
                patron.patron_lname, 
                patron.patron_sex, 
                patron.patron_mobile,
                patron.patron_email, 
                course.course_name AS course, 
                college.college_name AS college, 
                DATE(attendance.att_date) AS att_date, 
                attendance.att_log_in_time 
            FROM patron 
            JOIN course ON patron.course_id = course.course_id 
            JOIN college ON patron.college_id = college.college_id 
            JOIN attendance ON patron.patron_id = attendance.patron_id 
            WHERE 1=1
        `;
    
        const params = [];
        if (search) {
            q += ` AND (patron.tup_id LIKE ? OR patron.patron_fname LIKE ? OR patron.patron_lname LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
    
        if (startDate) {
            q += ` AND DATE(attendance.att_date) >= ?`;
            params.push(startDate);
        }
    
        if (endDate) {
            q += ` AND DATE(attendance.att_date) <= ?`;
            params.push(endDate);
        }
    
        const countQuery = `SELECT COUNT(*) AS total FROM (${q}) AS countQuery`;
    
        db.query(countQuery, params, (err, countResult) => {
            if (err) {
                console.error(err.message);
                res.status(500).send('Database error: ' + err.message);
                return;
            }
    
            const total = countResult[0].total;
    
            // Add pagination
            const offset = (page - 1) * limit;
            q += ` ORDER BY att_date DESC, att_log_in_time DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));
    
            db.query(q, params, (err, results) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Database error: ' + err.message);
                } else {
                    res.json({ results, total });
                }
            });
        });
    }); */

    
    app.get('/patronSort', (req, res) => {
        const { search, startDate, endDate, limit, page } = req.query;
    
        let q = `
            SELECT 
                patron.patron_id, 
                patron.tup_id, 
                patron.patron_fname, 
                patron.patron_lname, 
                patron.patron_sex, 
                patron.patron_mobile,
                patron.patron_email, 
                course.course_name AS course, 
                college.college_name AS college, 
                DATE(attendance.att_date) AS att_date, 
                attendance.att_log_in_time 
            FROM patron 
            JOIN course ON patron.course_id = course.course_id 
            JOIN college ON patron.college_id = college.college_id 
            JOIN attendance ON patron.patron_id = attendance.patron_id 
            WHERE 1=1
        `;
    
        const params = [];
        if (search) {
            q += ` AND (patron.tup_id LIKE ? OR patron.patron_fname LIKE ? OR patron.patron_lname LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
    
        if (startDate) {
            q += ` AND DATE(attendance.att_date) >= ?`;
            params.push(startDate);
        }
    
        if (endDate) {
            q += ` AND DATE(attendance.att_date) <= ?`;
            params.push(endDate);
        }
    
        const countQuery = `SELECT COUNT(*) AS total FROM (${q}) AS countQuery`;
    
        db.query(countQuery, params, (err, countResult) => {
            if (err) {
                console.error(err.message);
                res.status(500).send('Database error: ' + err.message);
                return;
            }
    
            const total = countResult[0].total;
    
            // Add pagination only if limit is not "All"
            if (limit !== "null") {
                const offset = (page - 1) * limit;
                q += ` ORDER BY att_date DESC, att_log_in_time DESC LIMIT ? OFFSET ?`;
                params.push(parseInt(limit), parseInt(offset));
            } else {
                q += ` ORDER BY att_date DESC, att_log_in_time DESC`; // No limit or offset
            }
    
            db.query(q, params, (err, results) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Database error: ' + err.message);
                } else {
                    res.json({ results, total });
                }
            });
        });
    });
        
    

app.get('/getCover', (req, res) => {
    const query = `SELECT 
                    b.book_cover, 
                    b.resource_id, 
                    r.resource_title
                FROM 
                    book b
                JOIN 
                    resources r
                ON 
                    b.resource_id = r.resource_id
                ORDER BY 
                    b.book_id DESC
                LIMIT 5`;
    
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error });
        
        // Convert BLOB data to base64 for use in React
        const covers = results.map(book => ({
            cover: Buffer.from(book.book_cover).toString('base64'),
            resource_id: (book.resource_id),
            resource_title: (book.resource_title)
        }));
        
        res.json(covers);
    });
});

app.get('/api/overdue-books', (req, res) => {
    const query = `
        SELECT p.tup_id, p.patron_fname, p.patron_lname, c.checkout_due, r.resource_id, r.resource_title, DATEDIFF(CURDATE(), c.checkout_due) AS overdue_days FROM checkout c JOIN patron p ON c.patron_id = p.patron_id JOIN resources r ON c.resource_id = r.resource_id JOIN book b ON r.resource_id = b.resource_id WHERE c.checkout_due < CURDATE() ORDER BY c.checkout_due DESC LIMIT 5;
    `;
    
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error });
        
        res.json(results);
    });
});

app.get('/checkout-info', async (req, res) => {
    /* try {
        const query = `SELECT p.tup_id, p.patron_fname, p.patron_lname, r.resource_title, c.checkout_due FROM patron p JOIN checkout c ON p.patron_id = c.patron_id JOIN resources r ON c.resource_id = r.resource_id WHERE c.checkout_due >= CURRENT_DATE()`;
        const [rows] = await db.execute(query);
        res.json(rows);
        await db.end();
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Internal Server Error');
    } */

    const query = `SELECT p.tup_id, p.patron_fname, p.patron_lname, r.resource_title, c.checkout_due FROM patron p JOIN checkout c ON p.patron_id = c.patron_id JOIN resources r ON c.resource_id = r.resource_id WHERE c.checkout_due >= CURRENT_DATE()`;
    
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error });
        
        res.json(results);
    });
});


/*------------SYNC DATA------------------*/
// Sync resources table
app.post("/sync/resources", async (req, res) => {
    const resource = req.body;

    //check first if resource exist 
    const resourceExists =await checkResourceIfExist(resource.resource_title)

    if (resourceExists) {
        console.log('Resource already exists.');
        return res.send({ status: 409, message: `Resource with a title "${resource.resource_title}" already exists. Skipping insertion.` });
    }


    const q = `
    INSERT INTO 
        resources (resource_title, resource_description, resource_published_date, resource_quantity, resource_is_circulation, dept_id, type_id, avail_id) 
    VALUES (?,?,?,?,?,?,?,?)`;

    const values = [
        resource.resource_title,
        resource.resource_description,
        resource.resource_published_date,
        resource.resource_quantity,
        resource.resource_is_circulation,
        resource.dept_id,
        resource.type_id,
        resource.avail_id
    ];
  
    db.query(q, values, (err, results) => {
      if (err) {
        console.error("Error syncing resources:", err);
        return res.status(500).send("Failed to sync resources.");
      } else {
        const insertedId = results.insertId; // Get the ID of the inserted row
        console.log("Resource synced successfully with ID:", insertedId);
        res.status(200).json({ message: "Resource synced successfully.", resource_id: insertedId });
      }
    });
});

// Sync authors table
app.post("/sync/authors", (req, res) => {
    const { author, resourceId } = req.body;

    // Step 1: Check if the author already exists
    const checkAuthorQuery = `
        SELECT author_id 
        FROM author 
        WHERE author_fname = ? AND author_lname = ?`;

    const checkValues = [author.author_fname, author.author_lname];

    db.query(checkAuthorQuery, checkValues, (err, results) => {
        if (err) {
            console.error("Error checking if author exists:", err);
            return res.status(500).send("Failed to check author.");
        }

        if (results.length > 0) {
            // If author exists, use the existing author_id
            const authorId = results[0].author_id;
            console.log("Author already exists with ID:", authorId);

            // Sync resource-authors relationship after author is found
            syncResourceAuthors(authorId, resourceId);

            return res.status(200).json({ message: "Author already exists.", author_id: authorId });
        } else {
            // Step 2: If the author does not exist, insert the new author
            const insertAuthorQuery = `
                INSERT INTO 
                    author (author_fname, author_lname) 
                VALUES (?,?)`;

            const insertValues = [author.author_fname, author.author_lname];

            db.query(insertAuthorQuery, insertValues, (err, results) => {
                if (err) {
                    console.error("Error syncing authors:", err);
                    return res.status(500).send("Failed to sync authors.");
                } else {
                    const authorId = results.insertId; // Get the ID of the inserted author
                    console.log("Author synced successfully with ID:", authorId);

                    // Sync resource-authors relationship after author is synced
                    syncResourceAuthors(authorId, resourceId);

                    res.status(200).json({ message: "Author synced successfully.", author_id: authorId });
                }
            });
        }
    });
});

// Sync resourceauthors table
const syncResourceAuthors = (authorId, resourceId) => {
    
    const q = `
    INSERT INTO 
        resourceauthors (resource_id, author_id) 
    VALUES (?,?)`;

    const values = [resourceId, authorId];

    db.query(q, values, (err) => {
      if (err) {
        console.error("Error syncing resourceauthors:", err);
      } else {
        console.log("Resource-Author relationship synced successfully.");
      }
    });
};

//sync publishers table
app.post("/sync/publisher", (req, res) => {
    const publisher = req.body;

    // Check if publisher already exists based on unique attributes (e.g., pub_name, pub_email)
    const checkQuery = `
    SELECT * FROM publisher 
    WHERE pub_name = ? AND pub_email = ?`;

    const checkValues = [
        publisher.pub_name,
        publisher.pub_email
    ];

    db.query(checkQuery, checkValues, (err, results) => {
        if (err) {
            console.error("Error checking publisher existence:", err);
            return res.status(500).send("Failed to check publisher existence.");
        }

        // If publisher exists, return the existing publisher ID
        if (results.length > 0) {
            console.log("Publisher already exists.");
            return res.status(200).json({
                message: "Publisher already exists.",
                pub_id: results[0].pub_id // Return the existing publisher ID
            });
        }

        // If publisher doesn't exist, insert new publisher
        const insertQuery = `
        INSERT INTO 
            publisher (pub_name, pub_address, pub_email, pub_phone, pub_website) 
        VALUES (?, ?, ?, ?, ?)`;

        const insertValues = [
            publisher.pub_name,
            publisher.pub_add,
            publisher.pub_email,
            publisher.pub_phone,
            publisher.pub_website
        ];

        db.query(insertQuery, insertValues, (err, results) => {
            if (err) {
                console.error("Error syncing publishers:", err);
                return res.status(500).send("Failed to sync publishers.");
            } else {
                const pubId = results.insertId;
                console.log("Publisher synced successfully.");

                // Send the response with the publisher ID
                return res.status(200).json({
                    message: "Publisher synced successfully.",
                    pub_id: pubId
                });
            }
        });
    });
});


//sync books table
app.post("/sync/book", upload.single('file'), async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    console.log(req.body)

    const { resourceId, pubId, book_isbn, topic_id } = req.body;
    const file = req.file ? fs.readFileSync(req.file.path) : null;

    const q = `
      INSERT INTO 
          book (book_cover, book_isbn, resource_id, pub_id, topic_id) 
      VALUES (?, ?, ?, ?, ?)`;

    const values = [
      file,
      book_isbn || 'n/a',
      resourceId,
      pubId,
      topic_id || null,
    ];

    db.query(q, values, (err) => {
      if (err) {
        console.error("Error syncing book:", err);
        res.status(500).send("Failed to sync book.");
      } else {
        console.log("Book synced successfully.");
        res.status(200).send("Book synced successfully.");
      }
    });
  } catch (error) {
    console.error("Error syncing book:", error.message);
    res.status(500).send("Internal server error.");
  }
});


//sync journal/newsletter table
app.post("/sync/journalnewsletter", upload.single('file'), async (req, res) => {
    try {
        // Log incoming request for debugging
        console.log("Received body:", req.body);
        console.log("Received file:", req.file);
    
        const { resourceId, jn_volume, jn_issue, topic_id } = req.body;
        const file = req.file ? fs.readFileSync(req.file.path) : null;
    
        const q = `
          INSERT INTO 
              journalnewsletter (jn_volume, jn_issue, jn_cover, resource_id, topic_id) 
          VALUES (?, ?, ?, ?, ?)`;
    
        const values = [
          jn_volume,
          jn_issue,
          file,
          resourceId,
          topic_id,
        ];
    
        db.query(q, values, (err) => {
          if (err) {
            console.error("Error syncing journal/newsletter:", err);
            res.status(500).send("Failed to sync journal/newsletter.");
          } else {
            console.log("Journal/Newsletter synced successfully.");
            res.status(200).send("Journal/Newsletter synced successfully.");
          }
        });
      } catch (error) {
        console.error("Error syncing Journal/Newsletter:", error.message);
        res.status(500).send("Internal server error.");
      }
});

//sync theses 
app.post("/sync/adviser",async (req,res)=>{
    const {adviser, resourceId} = req.body;
    console.log('adviser sent from frontend: ', adviser)

    const values =[
        adviser.adviser_fname,
        adviser.adviser_lname
    ];

    const adviserId = await checkAdviserIfExist(values)
    await syncThesisOnline(adviserId,resourceId,res)
})

//sync theses 
const syncThesisOnline = async(adviserId,resourceId,res)=>{
    const q = `
    INSERT INTO 
        thesis (resource_id,adviser_id) 
    VALUES (?, ?)`;

    db.query(q, [resourceId,adviserId], (err) => {
        if (err) {
          console.error("Error syncing thesis:", err);
          res.status(500).send("Failed to sync thesis.");
        } else {
          console.log("Thesis synced successfully.");
          res.status(200).send("Thesis synced successfully.");
        }
    });
}

app.post("/attendance", (req, res) => {
    //const { studentId, date, time } = req.body;
    const studentId = req.body.studentId;
    const date = req.body.date;
    const time = req.body.time;
 
  
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required." });
    }
  
    // Step 1: Fetch Student Name
    const getPatronIdQuery = "SELECT patron_id, patron_fname, patron_lname FROM patron WHERE tup_id = ?";
    db.query(getPatronIdQuery, [studentId], (err, results) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error retrieving patron ID." });
    }
    if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Student not found." });
    }

    const patronId = results[0].patron_id;
    const studentName = `${results[0].patron_fname} ${results[0].patron_lname}`;

    const logAttendanceQuery = "INSERT INTO attendance (att_log_in_time, att_date, patron_id) VALUES ( ?, ?, ?)";
    db.query(logAttendanceQuery, [time, date, patronId], (err) => {
        if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to log attendance." });
        }

        io.emit('attendanceUpdated');
        return res.status(200).json({
        success: true,
        studentName: studentName,
        message: "Attendance logged successfully.",
        });
      });
    });
  });


/*--------------------ONLINE CATALOG-------------------------- */
app.get('/featured-books', (req, res) => {
    const q = `
    SELECT 
        resources.resource_title, 
        resources.resource_id, 
        book.book_cover as resource_cover, 
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_name
    FROM resourceauthors
    JOIN resources ON resourceauthors.resource_id = resources.resource_id
    JOIN author ON resourceauthors.author_id = author.author_id
    JOIN book ON book.resource_id = resources.resource_id
    WHERE resources.type_id = '1'
    GROUP BY resources.resource_id, resources.resource_title, book.book_cover
    ORDER BY RAND()
    LIMIT 10
    `;

    db.query(q, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        console.log(results)
        return res.json(results); // Send the response as JSON
    });
});

app.get('/journals-newsletters', (req, res) => {
    const q = `
    SELECT 
        resources.resource_title, 
        resources.resource_id, 
        journalnewsletter.jn_cover as resource_cover, 
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_name
    FROM resourceauthors
    JOIN resources ON resourceauthors.resource_id = resources.resource_id
    JOIN author ON resourceauthors.author_id = author.author_id
    JOIN journalnewsletter ON journalnewsletter.resource_id = resources.resource_id
    WHERE resources.type_id = '2' OR resources.type_id = '3'  
    GROUP BY resources.resource_id, resources.resource_title, journalnewsletter.jn_cover
    ORDER BY RAND()
    LIMIT 10`;

    db.query(q, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        console.log(results)
        return res.json(results); // Send the response as JSON
    });
});

app.get('/featured-book', (req, res) => {
    const q = `
    SELECT 
        resources.resource_title,
        resources.resource_description,
        resources.resource_id, 
        book.book_cover, 
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_name
    FROM resourceauthors
    JOIN resources ON resourceauthors.resource_id = resources.resource_id
    JOIN author ON resourceauthors.author_id = author.author_id
    JOIN book ON book.resource_id = resources.resource_id
    WHERE resources.resource_description != 'n/a' AND 
    resources.type_id='1'
    GROUP BY resources.resource_id, resources.resource_title, book.book_cover
    LIMIT 1`;

    db.query(q, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        console.log(results)
        return res.json(results); // Send the response as JSON
    });
});

app.get('/resources', (req, res) => {
    const offset = parseInt(req.query.offset, 10) || 0;
    const keyword = `%${req.query.keyword || ''}%`;
    const type = req.query.type ? req.query.type.map(item => parseInt(item, 10)) : []
    const department = req.query.department ? req.query.department.map(item => parseInt(item, 10)) : []
    const topic = req.query.topic ? req.query.topic.map(item => parseInt(item, 10)) : []
    const sort = req.query.sort


    let whereClauses = [`(resources.resource_title LIKE ? OR author.author_fname LIKE ? OR author.author_lname LIKE ?)`];
    let params = [keyword, keyword, keyword];

    if (type.length > 0) {
        whereClauses.push(`resources.type_id IN (${type.map(() => '?').join(', ')})`);
        params.push(...type);
    }

    if (department.length > 0) {
        whereClauses.push(`resources.dept_id IN (${department.map(() => '?').join(', ')})`);
        params.push(...department);
    }

    // Only apply topic filter to book and journalnewsletter tables
    if (topic.length > 0) {
        whereClauses.push(`(book.topic_id IN (${topic.map(() => '?').join(', ')}) OR journalnewsletter.topic_id IN (${topic.map(() => '?').join(', ')}) )`);
        params.push(...topic, ...topic);  // Push the topic filter twice: once for book and once for journalnewsletter
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let sortBy = 'ORDER BY resources.resource_title ASC'; // Default sorting

    if (sort === 'a-z') {
        sortBy = 'ORDER BY resources.resource_title ASC';
    } else if (sort === 'z-a') {
        sortBy = 'ORDER BY resources.resource_title DESC';
    } else if (sort === 'newest') {
        sortBy = 'ORDER BY resources.resource_published_date DESC';
    } else if (sort === 'oldest') {
        sortBy = 'ORDER BY resources.resource_published_date ASC';
    }

    console.log(sort)
    const q = `
        SELECT 
            resources.resource_title,
            resources.resource_id, 
            resources.type_id,
            CASE
                WHEN resources.type_id = '1' THEN book.book_cover
                WHEN resources.type_id = '2' OR resources.type_id = '3' THEN journalnewsletter.jn_cover
            ELSE NULL
            END AS resource_cover,
            GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_name
        FROM resources
        LEFT JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id
        LEFT JOIN author ON resourceauthors.author_id = author.author_id
        LEFT JOIN book ON book.resource_id = resources.resource_id
        LEFT JOIN journalnewsletter ON journalnewsletter.resource_id = resources.resource_id
        ${whereClause}
        GROUP BY resources.resource_id, resources.resource_title, resources.resource_description, resources.type_id
        ${sortBy}
        LIMIT 10 OFFSET ?
    `;

     const countQ = `
        SELECT COUNT(DISTINCT resources.resource_id) AS total
        FROM resources
        LEFT JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id
        LEFT JOIN author ON resourceauthors.author_id = author.author_id
        LEFT JOIN book ON book.resource_id = resources.resource_id
        LEFT JOIN journalnewsletter ON journalnewsletter.resource_id = resources.resource_id
        ${whereClause}
    `;


    console.log('type: ', type)
    console.log('offset: ', offset)
    console.log('keyword: ', keyword)
    console.log('q: ', q)
    
    params.push(offset); // Add the offset as the last parameter
    console.log('params: ', params)

    // Execute the count query first
    db.query(countQ, params.slice(0, -1), (countErr, countResults) => {
        if (countErr) {
            console.error(countErr);
            return res.status(500).send({ error: 'Failed to fetch total count' });
        }

        const total = countResults[0].total;

        // Execute the main query
        db.query(q, params, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ error: 'Database query failed' });
            }
            // console.log(results);
            return res.json({ results, total });
        });
    });
});


app.get('/resources/view', (req, res) => {
    const id = req.query.id;
    console.log('view id: ', id);

    const q = `
       SELECT 
        resources.resource_title,
        resources.resource_published_date,
        resources.resource_id,
        resources.type_id,
        department.dept_name,
        department.dept_shelf_no,
        CASE
            WHEN resources.type_id IN ('1', '2', '3') THEN topic.topic_name
            ELSE NULL
        END AS topic_name,
        CASE
            WHEN resources.type_id = '1' THEN book.book_cover
            WHEN resources.type_id IN ('2', '3') THEN journalnewsletter.jn_cover
            ELSE NULL
        END AS resource_cover,
        topic.topic_row_no,
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_name
    FROM resources
    LEFT JOIN book ON resources.resource_id = book.resource_id
    LEFT JOIN journalnewsletter ON resources.resource_id = journalnewsletter.resource_id
    JOIN department ON resources.dept_id = department.dept_id
    LEFT JOIN topic 
        ON book.topic_id = topic.topic_id 
        OR journalnewsletter.topic_id = topic.topic_id
    LEFT JOIN resourceauthors ON resources.resource_id = resourceauthors.resource_id
    LEFT JOIN author ON resourceauthors.author_id = author.author_id
    WHERE resources.resource_id = ?
    GROUP BY 
        resources.resource_id,
        department.dept_name,
        department.dept_shelf_no,
        topic.topic_name,
        topic.topic_row_no`;

    db.query(q, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        if (results.length > 0) {
            console.log(results);
            // You can also fetch related books here if needed
            const relatedBooksQuery = `
                SELECT 
                    resources.resource_title,
                    resources.resource_id, 
                    resources.type_id,
                    CASE
                        WHEN resources.type_id = '1' THEN book.book_cover
                        WHEN resources.type_id IN ('2', '3') THEN journalnewsletter.jn_cover
                        ELSE NULL
                    END AS resource_cover,
                    GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_name
                FROM resources
                LEFT JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id
                LEFT JOIN author ON resourceauthors.author_id = author.author_id
                LEFT JOIN book ON book.resource_id = resources.resource_id
                LEFT JOIN journalnewsletter ON journalnewsletter.resource_id = resources.resource_id
                WHERE resources.type_id = ? AND resources.resource_id != ?
                GROUP BY resources.resource_id, resources.resource_title, resources.resource_description, resources.type_id
                ORDER BY RAND()
                LIMIT 5`;

            db.query(relatedBooksQuery, [results[0].type_id,results[0].resource_id], (err, relatedResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ error: 'Database query failed' });
                }

                // Send both results back to the client
                res.send({ results, relatedBooks: relatedResults });
            });
        } else {
            res.status(404).send({ error: 'Resource not found' });
        }
    });
});

/*------------------USER ACCOUNT-------------*/


app.get('/accounts', (req,res)=>{
    const keyword = req.query.keyword || '';
    const searchKeyword = `%${keyword}%`;
    const offset = parseInt(req.query.offset, 10)
    const params = [searchKeyword, searchKeyword, searchKeyword]
    const fname = parseInt(req.query.fname)
    const lname = parseInt(req.query.lname)
    const uname = parseInt(req.query.uname)
    const role = parseInt(req.query.role)
    const status = req.query.status

    console.log('status', status)
    console.log('role', role)

    let orderClauses = "";
    
    // Handle sorting by fname
    if (fname) {
        if (fname == '1') {
            orderClauses='ORDER BY staffaccount.staff_fname ASC';
        } else if (fname == '2') {
            orderClauses='ORDER BY staffaccount.staff_fname DESC';
        }
    }
    
    // Handle sorting by lname
    if (lname) {
        if (lname == '1') {
            orderClauses='ORDER BY staffaccount.staff_lname ASC';
        } else if (lname == '2') {
            orderClauses='ORDER BY staffaccount.staff_lname DESC';
        }
    }

    // Handle sorting by lname
    if (uname) {
        if (uname == '1') {
            orderClauses='ORDER BY staffaccount.staff_uname ASC';
        } else if (uname == '2') {
            orderClauses='ORDER BY staffaccount.staff_uname DESC';
        }
    }


    const whereClauses = [`(staff_fname LIKE ? OR staff_uname LIKE ? OR staff_lname LIKE ?)`]

    if(role){
        whereClauses.push(`staffaccount.role_id = '${role}'`)
    }
    if(status){
        whereClauses.push(`staffaccount.staff_status = '${status}'`)
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const q = `
        SELECT 
            staffaccount.staff_id, 
            staffaccount.staff_uname, 
            staffaccount.staff_lname, 
            staffaccount.staff_fname,
            staffaccount.staff_status,
            roles.role_name
        FROM staffaccount
        JOIN roles ON staffaccount.role_id = roles.role_id
        ${whereClause}
        ${orderClauses}
        LIMIT 5 OFFSET ?`
    
    const countQ = `
        SELECT COUNT(DISTINCT staff_id) as total
        FROM staffaccount
        ${whereClause}`

    console.log(q)
    
    db.query(countQ, params, (err,countResult)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        const totalUsers = countResult[0]?.total || 0;

        db.query(q, [...params, offset], (err,results)=>{
            if (err) {
                console.error(err);
                return res.status(500).send({ error: 'Database query failed' });
            }

            res.send({results,totalUsers});
        
        })
    })

        
})

app.get('/account/:id', (req,res)=>{
    const id = req.params.id;
    const keyword = req.query.keyword || '';

    const q = `
    SELECT staff_id, staff_fname, staff_lname, staff_uname, role_id FROM staffaccount WHERE staff_id = ?`


    db.query(q,[id], (err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        res.send(results);
    
    })
})

app.put('/account', (req,res)=>{
    console.log(req.body)
    const password = req.body.password;


    const q = `
    UPDATE  
        staffaccount 
    SET 
        staff_uname = ?,
        staff_fname = ?,
        staff_lname = ?,
        role_id = ?,
        staff_password = ?
    WHERE 
        staff_id = ?`

        bcrypt.hash(password,saltRounds,(err,hash)=>{
            if(err){
                console.log(err)
            }

            const values = [
                req.body.uname,
                req.body.fname,
                req.body.lname,
                req.body.role,
                hash,
                req.body.id
            ]

            db.query(q, values, (err,results)=>{
                if (err) {
                    console.error(err);
                    return res.status(500).send({ error: 'Database query failed' });
                }

                io.emit('userUpdated');
                res.send({status: 201, message:'User Edited Successfully'});
            
            })

        })
})

app.put('/account/deactivate/:id',(req,res)=>{
    const id = req.params.id;

    const q = `
    UPDATE 
        staffaccount
    SET 
        staff_status = ?
    WHERE 
        staff_id = ?`

    db.query(q, ['inactive', id],(err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        io.emit('userUpdated');
        res.send({status: 201, message:'User Deactivated'});
    })
})

app.put('/account/activate/:id',(req,res)=>{
    const id = req.params.id;

    const q = `
    UPDATE 
        staffaccount
    SET 
        staff_status = ?
    WHERE 
        staff_id = ?`

    db.query(q, ['active', id],(err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }
        
        io.emit('userUpdated');
        res.send({status: 201, message:'User Activated'});
    })
})

/*----------------------REPORT GENERATION---------------- */
app.get('/reports', (req, res) => {
    const type = req.query.type;
    const kind = req.query.kind;
    const startDate = req.query.startDate; // Custom start date
    const endDate = req.query.endDate; // Custom end date
  
    console.log(type);
    console.log(kind);
    console.log(startDate, endDate);
  
    switch (type) {
      case 'Attendance Report':
        generateAttendance(res, kind, startDate, endDate);
        break;
      case 'Inventory Report':
        generateInventory(res,kind);
        break;
      // Add cases for other report types as needed
    }
  });
  
const generateAttendance = async (res, kind, startDate, endDate) => {
    let q = `
      SELECT 
          patron.tup_id,
          patron.patron_fname,
          patron.patron_lname,
          patron.patron_sex,
          patron.patron_mobile,
          patron.patron_email,
          patron.category,
          college.college_name,
          course.course_name,
          attendance.att_log_in_time,
          attendance.att_date
      FROM attendance
      JOIN patron ON patron.patron_id = attendance.patron_id
      JOIN college ON patron.college_id = college.college_id
      JOIN course ON patron.course_id = course.course_id
    `;
  
    if (kind === 'Daily Report') {
      q += `WHERE attendance.att_date = CURRENT_DATE()`;
    } else if (kind === 'Monthly Report') {
      // Adjust the query to select records for the current month
      q += `WHERE MONTH(attendance.att_date) = MONTH(CURRENT_DATE()) AND YEAR(attendance.att_date) = YEAR(CURRENT_DATE())`;
    } else if (kind === 'Custom Date') {
      // If the kind is 'Custom Date', use the provided startDate and endDate
      q += `WHERE attendance.att_date BETWEEN ? AND ?`;
    }
  
    db.query(q,[startDate,endDate],(err,results)=>{
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        res.send(results)
    })
    
};

const generateInventory = async(res,kind)=>{
    let whereClause = ''

    switch(kind){
        case 'Book':
            whereClause+='WHERE resources.type_id = 1'
            break;
        case 'Journals':
            whereClause+='WHERE resources.type_id = 2'
            break;
        case 'Newsletters':
            whereClause+='WHERE resources.type_id = 3'
            break;
        case 'Thesis & Dissertations':
            whereClause+='WHERE resources.type_id = 4'
            break;
        case 'Available Resources':
            whereClause+='WHERE resources.avail_id = 1'
            break;
        case 'Lost Resources':
            whereClause+='WHERE resources.avail_id = 2'
            break;
        case 'Damaged Resources':
            whereClause+='WHERE resources.avail_id = 3'
            break;
    }
    
    let q = `
        SELECT 
			resources.resource_id,
            resources.resource_title, 
            resourcetype.type_name, 
            resources.resource_quantity, 
            department.dept_name,
            CASE
                WHEN resources.type_id IN ('1', '2', '3') THEN topic.topic_name
                ELSE 'n/a'
            END AS topic_name,
            GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names
        FROM resources
        JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id 
        JOIN author ON resourceauthors.author_id = author.author_id 
        JOIN resourcetype ON resources.type_id = resourcetype.type_id 
        JOIN department ON department.dept_id = resources.dept_id
        LEFT JOIN book ON resources.resource_id = book.resource_id
        LEFT JOIN journalnewsletter ON resources.resource_id = journalnewsletter.resource_id
        LEFT JOIN topic 
            ON (book.topic_id = topic.topic_id OR journalnewsletter.topic_id = topic.topic_id)
        ${whereClause}
        GROUP BY resources.resource_id`

        

        console.log(q)

        db.query(q,(err,results)=>{
            if (err) {
                console.error(err);
                return res.status(500).send({ error: 'Database query failed' });
            }
    
            res.send(results)
        })
}
  
/*------------------login------------------ */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        if (req.session.authenticated) {
            // User is already logged in
            return res.json(req.session);
        } else {
            const query = `
                SELECT staff_uname, staff_password, role_name
                FROM staffaccount
                JOIN roles ON staffaccount.role_id = roles.role_id
                WHERE staff_uname = ?`;

            db.query(query, [username], (err, results) => {
                if (err) return res.status(500).send({ error: 'Database query failed' });

                if (results.length > 0) {
                    const user = results[0];
                    const role = user.role_name;
                    bcrypt.compare(password, user.staff_password, (err, isMatch) => {
                        if (isMatch) {
                            req.session.authenticated = true;
                            req.session.user = { username, role };
                            res.status(200).json(req.session);
                        } else {
                            res.status(401).send({ message: 'Invalid username or password' });
                        }
                    });
                } else {
                    res.status(404).send({ message: 'User not found' });
                }
            });
        }
    }
});


app.get('/login', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false, user: null });
    }
});


app.get('/session', (req, res) => {
    if (req.session.authenticated) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).send({ message: 'Not authenticated' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to log out' });
        }
        res.clearCookie('connect.sid');  // Clear the session cookie
        res.status(200).send({ message: 'Logged out successfully' });
    });
});

server.listen(3001,()=>{
    console.log('this is the backend')
})

import express from "express";
import mysql from "mysql";
import cors from "cors";
import axios from 'axios';
import multer from 'multer'; // This is a tool that helps us upload files (like images or documents) from a form to our server.
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';

const app = express()
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE'
}));

// api key for google books
const apikey = "AIzaSyDq8MNGVWbLp-R-SFFe-SGL7Aa8CuMak0s";

// connect server to database
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'lrc-cla'
})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});


//how we create http server with react
const server = http.createServer(app)

// Server is a class
const io = new Server(server,{
    cors:{
        // url for frontend
        origin:"http://localhost:3000",
    }
})

// Handle WebSocket connections
io.on('connection', (socket) => {
  // Listen for an event from the client
  socket.on('newResource', () => {
    console.log('new data inserted')
    io.emit('updateCatalog');
  });
});

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


app.post('/save', upload.single('file'), async (req, res) => {
    const mediaType = req.body.mediaType;
    let adviserFname;
    let adviserLname;
    let existingPublisher;
    let filePath;

    //dito masstore yung URL/ImageFile
    let imageFile;

    //pag walang URL, undefined ung req.body.url
    console.log('URL: ',req.body.url)
    //pag walang file na inupload, undefined ung req.file
    console.log(req.file)
    
    // if not a URL
    if(req.file){
       filePath = req.file.path; // Get the file path 
       fs.readFile(filePath, (err, data) => {
            if (err) {
                return res.status(500).send(err); 
            }
            imageFile = data;
            //data
            // ganitong form mo siya isstore sa database
            //<Buffer ff d8 ff e1 5a 84 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 0c 00 0f 01 02 00 09 00 00 00 9e 00 00 00 10 01 02 00 13 00 00 00 a8 00 00 00 12 01 03 00 ... 2437749 more bytes>
        })
    }else if(req.body.url){
        const imageUrl = req.body.url; 
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        imageFile = response.data; // Image data in binary format (Buffer)
    }

    // initialize variables based on media type
    if(mediaType==='1'){
        existingPublisher = req.body.publisher_id; //this is not 0 if pinili niya ay existing na publisher
    }else if(mediaType==='4'){
        // split string
        //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
        const adviser = req.body.adviser.split(' ')
        adviserFname = adviser[0];
        adviserLname = adviser[1];
    }
    
    const authors = req.body.authors.split(',')

    console.log("publisher: ", req.body.publisher); // pag walang value to, this is an empty string

    //call insertResources and pass req
    await insertResources(res,req,authors).then((data)=>{
        const resourceId = data
        // For example, if mediaType is book, the rest of the data will be inserted sa book table and etc

        // however, before inserting the rest of the data inside the book table, we need to insert the publisher info if the mediaType is book
        if (mediaType === '1') {
            if(existingPublisher==0&&!req.body.publisher&&!req.body.publisher_address&&!req.body.publisher_email&&!req.body.publisher_number&&!req.body.publisher_website){
                //if walang napiling publisher/walang nahanap na publisher, set pub_id to null
                const q = 'INSERT INTO book (book_cover, book_isbn, resource_id, pub_id) VALUES (?, ?, ?, ?)';
                const book = [
                    imageFile,
                    req.body.isbn,
                    resourceId,
                    null
                ];

                db.query(q, book, (err, result) => {
                    if (err) {
                        return res.status(500).send(err); 
                    }

                    // Optionally, delete the file from disk after saving it to the database
                    // fs.unlink() method is used to delete files in Node.js
                    // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                    if(filePath){
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                        }); 
                    }

                    // Successfully inserted image, send response
                    return res.send('Successful');

                });
            }else{
                 const checkPubIdQ = "SELECT * FROM publisher WHERE pub_id = ?"
            
                // check if publisher exists
                db.query(checkPubIdQ,existingPublisher,(err,results)=>{
                    if (err) {
                        return res.status(500).send(err); 
                    }

                    //if no results found
                    if(results.length===0){

                        const pubQ = 'INSERT INTO publisher (pub_name, pub_address, pub_email, pub_phone, pub_website) VALUES (?, ?, ?, ?, ?)';

                        const publisher = [
                            req.body.publisher,
                            req.body.publisher_address,
                            req.body.publisher_email,
                            req.body.publisher_number,
                            req.body.publisher_website
                        ];

                        db.query(pubQ, publisher, (err, results) => {
                            if (err) {
                                return res.status(500).send(err); 
                            }
                            // Get the publisherId of the data you just inserted
                            const publisherId = results.insertId;

                            // Insert the file data into the database
                            const q = 'INSERT INTO book (book_cover, book_isbn, resource_id, pub_id) VALUES (?, ?, ?, ?)';
                            
                            const book = [
                                imageFile,
                                req.body.isbn,
                                resourceId,
                                publisherId
                            ];

                            db.query(q, book, (err, result) => {
                                if (err) {
                                    return res.status(500).send(err); 
                                }

                                // Optionally, delete the file from disk after saving it to the database
                                // fs.unlink() method is used to delete files in Node.js
                                // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                                if(filePath){
                                    fs.unlink(filePath, (unlinkErr) => {
                                        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                                    }); 
                                }
                                
                                // Successfully inserted image, send response
                                return res.send('Successful');
                            });
                        });
                    }else{
                        //pag may nahanap na publisher, store the id of chosen publisher in book database
                        const q = 'INSERT INTO book (book_cover, book_isbn, resource_id, pub_id) VALUES (?, ?, ?, ?)';
                        const book = [
                            imageFile,
                            req.body.isbn,
                            resourceId,
                            existingPublisher
                        ];

                        db.query(q, book, (err, result) => {
                            if (err) {
                                return res.status(500).send(err); 
                            }

                            // Optionally, delete the file from disk after saving it to the database
                            // fs.unlink() method is used to delete files in Node.js
                            // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                            if(filePath){
                                fs.unlink(filePath, (unlinkErr) => {
                                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                                }); 
                            }

                            // Successfully inserted 
                            return res.send('Successful');
                        });
                    }
                })
            }
        }else if(mediaType==='2'|| mediaType==='3'){
                // Insert the file data into the database
                const q = 'INSERT INTO journalnewsletter (jn_volume, jn_issue, jn_cover, resource_id) VALUES (?, ?, ?, ?)';
                const jn = [
                    req.body.volume,
                    req.body.issue,
                    imageFile,
                    resourceId
                ];

                db.query(q, jn, (err, result) => {
                    if (err) {
                        return res.status(500).send(err); 
                    }

                    // Optionally, delete the file from disk after saving it to the database
                    // fs.unlink() method is used to delete files in Node.js
                    // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                    if(filePath){
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                        }); 
                    }

                    // Successfully inserted image, send response
                    return res.send('Successful');
                });
        }else{
            //if thesis, after inserting data to authors, resourceauthors, and resources, check if adviser exists. If existing, insert directly to thesis table. if not, insert advisers first then insert to thesis table

            const checkIfAdviserExist = "SELECT * FROM adviser WHERE adviser_fname = ? AND adviser_lname = ?"
            const thesisQ = "INSERT INTO thesis (resource_id, adviser_id) VALUES (?,?)"
            const insertAdviser = "INSERT INTO adviser (adviser_fname, adviser_lname) VALUES (?,?)"

            db.query(checkIfAdviserExist,[adviserFname,adviserLname],(err,results)=>{
                if (err) {
                    return res.status(500).send(err); 
                }

                //if exist, insert to thesis table
                if(results.length>0){
                    db.query(thesisQ,[resourceId,results[0].adviser_id],(err,results)=>{
                        if (err) {
                            return res.status(500).send(err); 
                        }
                        return res.send('successful')
                    })
                }else{
                    //if adviser does not exist, insert it to adviser table
                    db.query(insertAdviser,[adviserFname,adviserLname],(err,results)=>{
                        if (err) {
                            return res.status(500).send(err); 
                        }
                        
                        //if inserted to adviser, insert to thesis table
                        const adviserId = results.insertId
                        db.query(thesisQ,[resourceId,adviserId],(err,results)=>{
                            if (err) {
                                return res.status(500).send(err); 
                            }
                            return res.send('successful')
                        })

                    })
                }
            })
        }
    })
});

//insert resources
const insertResources = async (res,req,authors)=>{
    return new Promise((resolve,reject)=>{
        const q = 'INSERT INTO resources (resource_title, resource_description, resource_published_date, resource_quantity, resource_is_circulation, dept_id, topic_id, type_id, avail_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

        const resources = [
            req.body.title,
            req.body.description,
            req.body.publishedDate,
            req.body.quantity,
            req.body.isCirculation,
            req.body.department,
            req.body.topic,
            req.body.mediaType,
            req.body.status
        ];

        db.query(q, resources,(err, results)=>{
            if (err) {
                return res.status(500).send(err); 
            }

            // Get the resource_id of the newly inserted row
            const resourceId = results.insertId
            
            insertAuthors(res,authors,resourceId).then(()=>{
                resolve(resourceId)
            })
        })
    })
}

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
    let adviserFname;
    let adviserLname;
    let existingPublisher;
    let filePath;

    //dito masstore yung URL/ImageFile
    let imageFile;

    if(req.file){
        filePath = req.file.path; // Get the file path 
        fs.readFile(filePath, (err, data) => {
             if (err) {
                 return res.status(500).send(err); 
             }
             imageFile = data;
             //data
             // ganitong form mo siya isstore sa database
             //<Buffer ff d8 ff e1 5a 84 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 0c 00 0f 01 02 00 09 00 00 00 9e 00 00 00 10 01 02 00 13 00 00 00 a8 00 00 00 12 01 03 00 ... 2437749 more bytes>
         })
     }

    // initialize variables based on media type
    if(mediaType==='1'){
        existingPublisher = req.body.publisher_id; //this is not 0 if pinili niya ay existing na publisher
    }else if(mediaType==='4'){
        // split string
        //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
        const adviser = req.body.adviser.split(' ')
        adviserFname = adviser[0];
        adviserLname = adviser[1];
    }

    const authors = req.body.authors.split(',')

    console.log(typeof mediaType)

    await editResource(res,req,authors,resourceId).then(()=>{
        // For example, if mediaType is book, the rest of the data will be inserted sa book table and etc

        // however, before inserting the rest of the data inside the book table, we need to insert the publisher info if the mediaType is book
        if (mediaType === '1') {
            if(existingPublisher==0&&!req.body.publisher&&!req.body.publisher_address&&!req.body.publisher_email&&!req.body.publisher_number&&!req.body.publisher_website){
                //if walang napiling publisher/walang nahanap na publisher, set pub_id to null
                let q;
                let book;

                // ibig sabihin may inupload si user na image
                // so we need to insert the image,pag hindi naman, as is lang ung image
                if(typeof filePath === 'string'){
                    q = `
                        UPDATE 
                            book
                        SET 
                            book_cover = ?,
                            book_isbn = ?,
                            resource_id = ?,
                            pub_id = ?
                        WHERE 
                            resource_id`
                    book = [
                        imageFile,
                        req.body.isbn,
                        resourceId,
                        null,
                        resourceId
                    ];
                }else{
                    q = `
                        UPDATE 
                            book
                        SET 
                            book_isbn = ?,
                            resource_id = ?,
                            pub_id = ?
                        WHERE 
                            resource_id`
                    book = [
                        req.body.isbn,
                        resourceId,
                        null,
                        resourceId
                    ];
                }

                db.query(q, book, (err, result) => {
                    if (err) {
                        return res.status(500).send(err); 
                    }

                    // Optionally, delete the file from disk after saving it to the database
                    // fs.unlink() method is used to delete files in Node.js
                    // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                    if(filePath){
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                        }); 
                    }

                    // Successfully inserted image, send response
                    return res.send('Successful');

                });
            }else{
                 const checkPubIdQ = "SELECT * FROM publisher WHERE pub_id = ?"
            
                // check if publisher exists
                db.query(checkPubIdQ,existingPublisher,(err,results)=>{
                    if (err) {
                        return res.status(500).send(err); 
                    }

                    //if no results found
                    if(results.length===0){

                        const pubQ = 'INSERT INTO publisher (pub_name, pub_address, pub_email, pub_phone, pub_website) VALUES (?, ?, ?, ?, ?)';

                        const publisher = [
                            req.body.publisher,
                            req.body.publisher_address,
                            req.body.publisher_email,
                            req.body.publisher_number,
                            req.body.publisher_website
                        ];

                        db.query(pubQ, publisher, (err, results) => {
                            if (err) {
                                return res.status(500).send(err); 
                            }
                            // Get the publisherId of the data you just inserted
                            const publisherId = results.insertId;

                            // Insert the file data into the database
                           //if walang napiling publisher/walang nahanap na publisher, set pub_id to null
                            let q;
                            let book;

                            // ibig sabihin may inupload si user na image
                            // so we need to insert the image,pag hindi naman, as is lang ung image
                            if(typeof filePath === 'string'){
                                q = `
                                    UPDATE 
                                        book
                                    SET 
                                        book_cover = ?,
                                        book_isbn = ?,
                                        pub_id = ?
                                    WHERE 
                                        resource_id`
                                book = [
                                    imageFile,
                                    req.body.isbn,
                                    publisherId,
                                    resourceId
                                ];
                            }else{
                                q = `
                                    UPDATE 
                                        book
                                    SET 
                                        book_isbn = ?,
                                        pub_id = ?
                                    WHERE 
                                        resource_id`
                                book = [
                                    req.body.isbn,
                                    publisherId,
                                    resourceId
                                ];
                            }

                            db.query(q, book, (err, result) => {
                                if (err) {
                                    return res.status(500).send(err); 
                                }

                                // Optionally, delete the file from disk after saving it to the database
                                // fs.unlink() method is used to delete files in Node.js
                                // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                                if(typeof filePath === 'string'){
                                    fs.unlink(filePath, (unlinkErr) => {
                                        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                                    }); 
                                }
                                
                                // Successfully inserted image, send response
                                return res.send('Successful');
                            });
                        });
                    }else{
                        //pag may nahanap na publisher, store the id of chosen publisher in book database
                        //if walang napiling publisher/walang nahanap na publisher, set pub_id to null
                        let q;
                        let book;

                        // ibig sabihin may inupload si user na image
                        // so we need to insert the image,pag hindi naman, as is lang ung image
                        if(typeof filePath === 'string'){
                            q = `
                                UPDATE 
                                    book
                                SET 
                                    book_cover = ?,
                                    book_isbn = ?,
                                    pub_id = ?
                                WHERE 
                                    resource_id`
                            book = [
                                imageFile,
                                req.body.isbn,
                                existingPublisher,
                                resourceId
                            ];
                        }else{
                            q = `
                                UPDATE 
                                    book
                                SET 
                                    book_isbn = ?,
                                    pub_id = ?
                                WHERE 
                                    resource_id`
                            book = [
                                req.body.isbn,
                                existingPublisher,
                                resourceId
                            ];
                        }


                        db.query(q, book, (err, result) => {
                            if (err) {
                                return res.status(500).send(err); 
                            }

                            // Optionally, delete the file from disk after saving it to the database
                            // fs.unlink() method is used to delete files in Node.js
                            // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                            if(typeof filePath === 'string'){
                                fs.unlink(filePath, (unlinkErr) => {
                                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                                }); 
                            }

                            // Successfully inserted 
                            return res.send('Successful');
                        });
                    }
                })
            }
        }else if(mediaType==='2'|| mediaType==='3'){
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
                    req.body.volume,
                    req.body.issue,
                    imageFile,
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
                    req.body.volume,
                    req.body.issue,
                    resourceId
                ]
            }
                
                db.query(q, jn, (err, result) => {
                    if (err) {
                        return res.status(500).send(err); 
                    }

                    // Optionally, delete the file from disk after saving it to the database
                    // fs.unlink() method is used to delete files in Node.js
                    // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                    if(typeof filePath === 'string'){
                        fs.unlink(filePath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                        }); 
                    }

                    // Successfully inserted image, send response
                    return res.send('Successful');
                });
        }else{
            //if thesis, after inserting data to authors, resourceauthors, and resources, check if adviser exists. If existing, insert directly to thesis table. if not, insert advisers first then insert to thesis table
            const checkIfAdviserExist = "SELECT * FROM adviser WHERE adviser_fname = ? AND adviser_lname = ?"
            const thesisQ = `
                UPDATE
                    thesis
                SET
                    adviser_id = ?
                WHERE
                    resource_id = ?`
                
            const insertAdviser = "INSERT INTO adviser (adviser_fname, adviser_lname) VALUES (?,?)"

            db.query(checkIfAdviserExist,[adviserFname,adviserLname],(err,results)=>{
                if (err) {
                    return res.status(500).send(err); 
                }

                //if exist, insert to thesis table
                if(results.length>0){
                    db.query(thesisQ,[results[0].adviser_id,resourceId],(err,results)=>{
                        if (err) {
                            return res.status(500).send(err); 
                        }
                        return res.send('successful')
                    })
                }else{
                    //if adviser does not exist, insert it to adviser table
                    db.query(insertAdviser,[adviserFname,adviserLname],(err,results)=>{
                        if (err) {
                            return res.status(500).send(err); 
                        }
                        
                        //if inserted to adviser, insert to thesis table
                        const adviserId = results.insertId
                        db.query(thesisQ,[adviserId,resourceId],(err,results)=>{
                            if (err) {
                                return res.status(500).send(err); 
                            }
                            return res.send('successful')
                        })

                    })
                }
            })
        }
    })
})

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
            topic_id = ?,
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
            req.body.topic,
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

//retrieve list of department from database
app.get('/departments',(req,res)=>{
    const q = 'SELECT * FROM department'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
})

//retrieve list of catalog from database
app.get('/catalog',(req,res)=>{
    const q = 'SELECT * FROM catalog'

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

//retrieve list of genre from database
app.get('/genre',(req,res)=>{
    const q = 'SELECT * FROM genre'

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

//get catalog details 
app.get('/catalogdetails/:pagination',(req,res)=>{
    const page = parseInt(req.params.pagination,10)

    const q =
    `
    SELECT 
        resources.resource_title, 
        resources.resource_id, 
        resourcetype.type_name, 
        resources.resource_quantity, 
        department.dept_shelf_no,
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names
    FROM resources 
    JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id 
    JOIN author ON resourceauthors.author_id = author.author_id 
    JOIN topic ON resources.topic_id = topic.topic_id 
    JOIN resourcetype ON resources.type_id = resourcetype.type_id 
    JOIN department ON department.dept_id = resources.dept_id
    GROUP BY resources.resource_id
    LIMIT 5 OFFSET ?`;

    db.query(q,page,(err,results)=>{
        if(err) return res.send(err)
        if(results.length>0){
            return res.json(results)
        }
            
    })
})

// //get specific resource for viewing purposes
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
        resources.topic_id, 
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
        book.book_cover 
    FROM resources 
    JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id 
    JOIN author ON resourceauthors.author_id = author.author_id 
    JOIN topic ON resources.topic_id = topic.topic_id 
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
        resources.topic_id,
        resources.resource_is_circulation,
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names,
        journalnewsletter.jn_volume,
        journalnewsletter.jn_issue,
        journalnewsletter.jn_cover
    FROM resources
    JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id
    JOIN author ON resourceauthors.author_id = author.author_id
    JOIN topic ON resources.topic_id = topic.topic_id
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
        resources.topic_id,
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
    JOIN topic ON resources.topic_id = topic.topic_id
    JOIN resourcetype ON resources.type_id = resourcetype.type_id
    JOIN thesis ON thesis.resource_id = thesis.resource_id
    JOIN adviser ON adviser.adviser_id = thesis.adviser_id
    WHERE resources.resource_id = ?
    GROUP BY resources.resource_id`

    db.query(q,[id],(err,result)=>{
        if(err) return res.send(err)
        console.log(result[0])
        return res.json(result)
    })
}

app.get('/resource/search', async (req, res) => {
    const searchQuery = req.query.q;
    const searchFilter = req.query.filter;
    console.log(searchQuery);
    console.log(searchFilter)



    // const query = 
    // `SELECT 
    //     resource_Id 
    // FROM 
    //     resources 
    // WHERE 
    //     resource_title 
    // LIKE ?`;

    // db.query(query, [`%${searchQuery}%`], async (err, results) => {
    //     if (err) return res.status(500).send(err);

    //     if (results.length !== 0) {
    //         const searchResults = [];

    //         const titleAuthorQuery = `
    //             SELECT 
    //                 resources.resource_title, 
    //                 resources.resource_id,
    //                 book.book_cover, 
    //                 CONCAT(author.author_fname, ' ', author.author_lname) AS author_name 
    //             FROM resourceauthors 
    //             JOIN resources ON resourceauthors.resource_id = resources.resource_id 
    //             JOIN author ON resourceauthors.author_id = author.author_id 
    //             JOIN book ON book.resource_id = resources.resource_id 
    //             WHERE resourceauthors.resource_id = ?`;

    //         try {
    //             await Promise.all(
    //                 results.map(item => {
    //                     return new Promise((resolve, reject) => {
    //                         db.query(titleAuthorQuery, [item.resource_Id], (err, results) => {
    //                             if (err) return reject(err); // Reject on query error

    //                             if (results.length > 0) {
    //                                 searchResults.push({
    //                                     title: results[0].resource_title,
    //                                     author: results[0].author_name,
    //                                     cover: results[0].book_cover,
    //                                     id: results[0].resource_id
    //                                 });
    //                             }
    //                             resolve(); // Resolve the promise
    //                         });
    //                     });
    //                 })
    //             );

    //             console.log(searchResults);
    //             res.json(searchResults); // Send the collected results
    //         } catch (err) {
    //             res.status(500).send(err); // Handle errors in the inner queries
    //         }
    //     } else {
    //         res.send([]); // No results found
    //     }
    // });
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

//const q = 'SELECT * FROM patron';

const q = "SELECT patron.patron_id, patron.tup_id, patron.patron_fname, patron.patron_lname, patron.patron_sex, patron.patron_mobile, course.course_name AS course, college.college_name AS college, DATE(attendance.att_date) AS att_date, attendance.att_log_in_time FROM patron JOIN course ON patron.course_id = course.course_id JOIN college ON patron.college_id = college.college_id JOIN attendance ON patron.patron_id = attendance.patron_id ORDER BY att_date DESC, att_log_in_time DESC";

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

app.get('/patronSort', (req, res) => {
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
    });
});



app.get('/catalog/search',(req,res)=>{
    const searchKeyword = req.query.searchKeyword || '';
    const searchFilter = req.query.searchFilter || '';
    console.log(searchFilter)
    switch(searchFilter){
        case 'title':
            searchByTitle(searchKeyword,res)
            break;
        case 'author':
            searchByAuthor(searchKeyword,res);
            break;
    }
})

const searchByTitle = (searchKeyword,res)=>{
    const q = `
        SELECT 
            resources.resource_title, 
            resources.resource_id, 
            resourcetype.type_name, 
            resources.resource_quantity, 
            department.dept_shelf_no,
            GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names
        FROM resources 
        JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id 
        JOIN author ON resourceauthors.author_id = author.author_id 
        JOIN topic ON resources.topic_id = topic.topic_id 
        JOIN resourcetype ON resources.type_id = resourcetype.type_id 
        JOIN department ON department.dept_id = resources.dept_id
        WHERE resources.resource_title LIKE ?
        GROUP BY resources.resource_id`

        db.query(q, [`%${searchKeyword}%`],(err,results)=>{
            if(err) res.send(err)
            if(results.length>0){
                res.json(results)
                // console.log(results)
            }else{
                res.send({})
            }
        })
}

const searchByAuthor = (searchKeyword,res)=>{
    const q = `
        SELECT 
            resources.resource_title, 
            resources.resource_id, 
            resourcetype.type_name, 
            resources.resource_quantity, 
            department.dept_shelf_no,
            GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names
        FROM resources 
        JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id 
        JOIN author ON resourceauthors.author_id = author.author_id 
        JOIN topic ON resources.topic_id = topic.topic_id 
        JOIN resourcetype ON resources.type_id = resourcetype.type_id 
        JOIN department ON department.dept_id = resources.dept_id
        WHERE author.author_fname LIKE ? OR author.author_lname LIKE ?
        GROUP BY resources.resource_id`

        db.query(q, [`%${searchKeyword}%`,`%${searchKeyword}%`],(err,results)=>{
            if(err) res.send(err)
            if(results.length>0){
                res.json(results)
            }else{
                res.send({})
            }
        })
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

        return res.status(200).json({
        success: true,
        studentName: studentName,
        message: "Attendance logged successfully.",
        });
      });
    });
  });

server.listen(3001,()=>{
    console.log('this is the backend')
})


import express from "express"
import mysql from "mysql"
import cors from "cors"
import axios from 'axios'
import multer from 'multer' // This is a tool that helps us upload files (like images or documents) from a form to our server.
import fs from 'fs'

const app = express()
app.use(express.json())
app.use(cors({
    // origin: 'http://localhost:3000',
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
                            !req.body.publisher?null:req.body.publisher,
                            !req.body.publisher_address?null:req.body.publisher_address,
                            !req.body.publisher_email?null:req.body.publisher_email,
                            !req.body.publisher_number?null:req.body.publisher_number,
                            !req.body.publisher_website?null:req.body.publisher_website
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

                            // Successfully inserted image, send response
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

// for updating resources
app.put('/edit/:id', upload.single('file'), async (req, res) => {
    const id = req.params.id;

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
    console.log(id)

    await editResources(res,req,authors,id).then((data)=>{
        const resourceId = data

        console.log(resourceId)
        // For example, if mediaType is book, the rest of the data will be inserted sa book table and etc

        // however, before inserting the rest of the data inside the book table, we need to insert the publisher info if the mediaType is book
        // if (mediaType === '1') {
        //     //if walang napiling publisher/walang nahanap na publisher, set pub_id to null
        //     if(existingPublisher==0&&!req.body.publisher&&!req.body.publisher_address&&!req.body.publisher_email&&!req.body.publisher_number&&!req.body.publisher_website){
        //         const q = `
        //             UPDATE 
        //                 book
        //             SET 
        //                 book_cover = ?,
        //                 book_isbn = ?, 
        //                 resource_id = ?, 
        //                 pub_id = ?
        //             WHERE 
        //                 resource_id = ?`;
        //         const book = [
        //             imageFile,
        //             req.body.isbn,
        //             resourceId,
        //             null,
        //             id
        //         ];

        //         db.query(q, book, (err, result) => {
        //             if (err) {
        //                 return res.status(500).send(err); 
        //             }

        //             // Optionally, delete the file from disk after saving it to the database
        //             // fs.unlink() method is used to delete files in Node.js
        //             // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
        //             if(filePath){
        //                 fs.unlink(filePath, (unlinkErr) => {
        //                     if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        //                 }); 
        //             }

        //             // Successfully inserted image, send response
        //             return res.send('Successful');

        //         });
        //     }else{
        //          const checkPubIdQ = "SELECT * FROM publisher WHERE pub_id = ?"
            
        //         // check if publisher exists
        //         db.query(checkPubIdQ,existingPublisher,(err,results)=>{
        //             if (err) {
        //                 return res.status(500).send(err); 
        //             }

        //             //if no results found
        //             if(results.length===0){
        //                 const pubQ = 'INSERT INTO publisher (pub_name, pub_address, pub_email, pub_phone, pub_website) VALUES (?, ?, ?, ?, ?)';

        //                 const publisher = [
        //                     !req.body.publisher?null:req.body.publisher,
        //                     !req.body.publisher_address?null:req.body.publisher_address,
        //                     !req.body.publisher_email?null:req.body.publisher_email,
        //                     !req.body.publisher_number?null:req.body.publisher_number,
        //                     !req.body.publisher_website?null:req.body.publisher_website
        //                 ];

        //                 db.query(pubQ, publisher, (err, results) => {
        //                     if (err) {
        //                         return res.status(500).send(err); 
        //                     }
        //                     // Get the publisherId of the data you just inserted
        //                     const publisherId = results.insertId;

        //                     // update data into the database
        //                     const q = `
        //                     UPDATE 
        //                         book
        //                     SET 
        //                         book_cover = ?,
        //                         book_isbn = ?, 
        //                         resource_id = ?, 
        //                         pub_id = ?
        //                     WHERE 
        //                         resource_id = ?`;
                            
        //                     const book = [
        //                         imageFile,
        //                         req.body.isbn,
        //                         resourceId,
        //                         publisherId,
        //                         id
        //                     ];

        //                     db.query(q, book, (err, result) => {
        //                         if (err) {
        //                             return res.status(500).send(err); 
        //                         }

        //                         // Optionally, delete the file from disk after saving it to the database
        //                         // fs.unlink() method is used to delete files in Node.js
        //                         // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
        //                         if(filePath){
        //                             fs.unlink(filePath, (unlinkErr) => {
        //                                 if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        //                             }); 
        //                         }
                                
        //                         // Successfully inserted image, send response
        //                         return res.send('Successful');
        //                     });
        //                 });
        //             }else{
        //                 //pag may nahanap na publisher, store the id of chosen publisher in book database
        //                 const q = `
        //                     UPDATE 
        //                         book
        //                     SET 
        //                         book_cover = ?,
        //                         book_isbn = ?, 
        //                         resource_id = ?, 
        //                         pub_id = ?
        //                     WHERE 
        //                         resource_id = ?`;

        //                 const book = [
        //                     imageFile,
        //                     req.body.isbn,
        //                     resourceId,
        //                     existingPublisher,
        //                     id
        //                 ];

        //                 db.query(q, book, (err, result) => {
        //                     if (err) {
        //                         return res.status(500).send(err); 
        //                     }

        //                     // Optionally, delete the file from disk after saving it to the database
        //                     // fs.unlink() method is used to delete files in Node.js
        //                     // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
        //                     if(filePath){
        //                         fs.unlink(filePath, (unlinkErr) => {
        //                             if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        //                         }); 
        //                     }

        //                     // Successfully inserted image, send response
        //                     return res.send('Successful');
        //                 });
        //             }
        //         })
        //     }
        // }
    })
});

// edit resources
const editResources = async (res,req,authors,id)=>{
    return new Promise((resolve,reject)=>{
        const q = `
        UPDATE
            resources
        SET
            resource_title = ?,
            resource_description = ?,
            resource_published_date  = ?,
            resource_quantity = ?,
            resource_is_circulation = ?,
            dept_id = ?,
            topics_id = ?,
            type_id = ?,
            avail_id = ?
        WHERE 
            resource_id = ?
        `

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
            id
        ];

        db.query(q, resources,(err, results)=>{
            if (err) {
                return res.status(500).send(err); 
            }

            // editAuthors(res,authors,id).then(()=>{
            resolve(id)
            // })
        })
    })
}


//insert authors 
const editAuthors = async (res,authors,resourceId)=>{
    return new Promise((resolve,reject)=>{
        const deleteResourceAuthorsQ = `
            DELETE FROM resourceauthors
            WHERE resource_id = ?
        `
        //insert authors
        const authorQ = `
            INSERT INTO author (author_fname, author_lname) VALUES (?, ?) `
        const resourceAuthorQ = `
            INSERT INTO resourceauthors (resource_id, author_id) VALUES (?, ?)`
        const checkIfAuthorExist =`
            SELECT author_id 
            FROM author 
            WHERE author_fname = ? AND author_lname = ?`

        //remove all records of resource_id under resourceauthors table
        db.query(deleteResourceAuthorsQ,[resourceId],(err,result)=>{
            if (err) {
                return res.status(500).send(err); 
            }

            //insert new authors
            authors.forEach(element => {
                const nameParts = element.split(' '); 
                // const fname = nameParts[0]; // First name
                // const lname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''; // Last name (handles multiple words)
                const fname = nameParts.slice(0,-1).join(" "); // First name
                const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''; // Last name (handles multiple words)
    
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
                getNewsletterJournalResource(id,res);
                break;
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
        resources.cat_id,
        resources.resource_is_circulation,
        GROUP_CONCAT(CONCAT(author.author_fname, ' ', author.author_lname) SEPARATOR ', ') AS author_names,
        journalnewsletter.jn_volume,
        journalnewsletter.jn_issue,
        journalnewsletter.jn_cover
    FROM resources
    JOIN resourceauthors ON resourceauthors.resource_id = resources.resource_id
    JOIN author ON resourceauthors.author_id = author.author_id
    JOIN catalog ON resources.cat_id = catalog.cat_id
    JOIN resourcetype ON resources.type_id = resourcetype.type_id
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
        resources.cat_id,
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
    JOIN catalog ON resources.cat_id = catalog.cat_id
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

app.get('/view',(req,res)=>{
    const q = 'SELECT book_cover FROM book'
    db.query(q,(err,results)=>{
        if(err) res.send(err)
        if(results.length>0){
            res.json(results[0])
        }
    })
})

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

app.listen(3001,()=>{
    console.log('this is the backend')
})

import express from "express"
import mysql from "mysql"
import cors from "cors"
import axios from 'axios'
import multer from 'multer' // This is a tool that helps us upload files (like images or documents) from a form to our server.
import fs from 'fs'

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

app.post('/save', upload.single('file'), (req, res) => {
    const mediaType = req.body.mediaType;
    let adviserFname;
    let adviserLname;
    let genre;
    let existingPublisher;
    let filePath;
    
    if(req.file){
       filePath = req.file.path; // Get the file path 
    }

    if(mediaType==='1'){
        genre = req.body.genre.split(',')
        existingPublisher = req.body.publisher_id; //this is not 0 if pinili niya ay existing na publisher
    }else if(mediaType==='4'){
        // split string
        //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
        const adviser = req.body.adviser.split(' ')
        adviserFname = adviser[0];
        adviserLname = adviser[1];
    }
    
   
    const authors = req.body.authors.split(',')

    // //insert data in resources data
    const q = 'INSERT INTO resources (resource_title, resource_description, resource_published_date, resource_quantity, resource_is_circulation, dept_id, cat_id,type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    const resources = [
        req.body.title,
        req.body.description,
        req.body.publishedDate,
        req.body.quantity,
        req.body.isCirculation,
        req.body.department,
        req.body.course,
        req.body.mediaType
    ];

    db.query(q, resources, (err, results) => {
        if (err) {
            return res.status(500).send(err); 
        }

        // Get the resource_id of the newly inserted row
        const resourceId = results.insertId;

        //insert authors
        const authorQ = 'INSERT INTO author (author_fname, author_lname) VALUES (?, ?)'
        const resourceAuthorQ = 'INSERT INTO resourceauthors (resource_id, author_id) VALUES (?, ?)'
        const checkIfAuthorExist ='SELECT author_id FROM author WHERE author_fname = ? AND author_lname = ?'
        authors.forEach(element => {
            const nameParts = element.split(' '); 
            const fname = nameParts[0]; // First name
            const lname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''; // Last name (handles multiple words)

            const authorValue = [
                fname,
                lname
            ]

            // check if author already exist
            db.query(checkIfAuthorExist,[fname,lname], (err,results)=>{
                if (err) {
                    return res.status(500).send(err); 
                }
                
                //pag walang nahanap
                if(results.length===0){
                    db.query(authorQ,authorValue,(err,results)=>{
                        if (err) {
                            return res.status(500).send(err); 
                        }
        
                        //author Id nung author info na kakainsert lang
                        const authorId = results.insertId;
        
                        //if author is inserted, insert sa resourceAuthor table
                        db.query(resourceAuthorQ,[resourceId,authorId],(req,res)=>{
                            if (err) {
                                return res.status(500).send(err); 
                            }
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
                    })
                }
            })
            
            
        });

        //if resource is inserted in resources table, check mediaType and insert the rest of the data to their corresponding media type.
        // For example, if mediaType is book, the rest of the data will be inserted sa book table and etc

        // however, before inserting the rest of the data inside the book table, we need to insert the publisher info if the mediaType is book
        if (mediaType === '1') {
            const checkPubIdQ = "SELECT * FROM publisher WHERE pub_id = ?"
            
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
                    });
                }else{
                    // Read the file data
                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                            return res.status(500).send(err); 
                        }
                        //data
                        // ganitong form mo siya isstore sa database
                        //<Buffer ff d8 ff e1 5a 84 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 0c 00 0f 01 02 00 09 00 00 00 9e 00 00 00 10 01 02 00 13 00 00 00 a8 00 00 00 12 01 03 00 ... 2437749 more bytes>
                        
                        // Insert the file data into the database
                        const q = 'INSERT INTO book (book_cover, book_isbn, resource_id, pub_id) VALUES (?, ?, ?, ?)';
                        const book = [
                            data,
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
                            fs.unlink(filePath, (unlinkErr) => {
                                if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                            });

                            // Successfully inserted image, send response
                            // return res.send('Successful');
                            
                            //insert to bookgenre
                            //store yung id ng kakastore na book sa bookId
                            const bookId = result.insertId;
                            const bookGenreQ = 'INSERT INTO bookgenre (book_id, genre_id) VALUES (?,?)'

                            //iterate through genre array
                            genre.forEach(element=>{
                                db.query(bookGenreQ,[bookId,element],(err,result)=>{
                                    if (err) {
                                        return res.status(500).send(err); 
                                    }
                                    return res.send('successful')
                                })
                                
                            })

                            

                        });
                    });
                }
            })
            
        }else if(mediaType==='2'|| mediaType==='3'){
            // Read the file data
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    return res.status(500).send(err); 
                }
                //data
                // ganitong form mo siya isstore sa database
                //<Buffer ff d8 ff e1 5a 84 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 0c 00 0f 01 02 00 09 00 00 00 9e 00 00 00 10 01 02 00 13 00 00 00 a8 00 00 00 12 01 03 00 ... 2437749 more bytes>
                
                // Insert the file data into the database
                const q = 'INSERT INTO journalnewsletter (jn_volume, jn_issue, jn_cover, resource_id) VALUES (?, ?, ?, ?)';
                const jn = [
                    req.body.volume,
                    req.body.issue,
                    data,
                    resourceId
                ];

                db.query(q, jn, (err, result) => {
                    if (err) {
                        return res.status(500).send(err); 
                    }

                    // Optionally, delete the file from disk after saving it to the database
                    // fs.unlink() method is used to delete files in Node.js
                    // filePath - a string, Buffer or URL that, represents the file or symbolic link that has to be removed.
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                    });

                    // Successfully inserted image, send response
                    return res.send('Successful');
                });
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
    });
});


// retrieve book information from google books api using isbn
app.get('/bookData/:isbn',async (req,res)=>{
    const isbn = req.params.isbn
    try{
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apikey}`);
        //console.log(response.data)
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
           return res.send(results)
    })
})

//retrieve list of catalog from database
app.get('/catalog',(req,res)=>{
    const q = 'SELECT * FROM catalog'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.send(results)
    })
})

//retrieve list of genre from database
app.get('/genre',(req,res)=>{
    const q = 'SELECT * FROM genre'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.send(results)
    })
})

// retrieve list of genre from database
app.get('/publishers',(req,res)=>{
    const q = 'SELECT * FROM publisher'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.send(results)
    })
})

//retrieve list of genre from database
app.get('/authors',(req,res)=>{
    const q = 'SELECT * FROM author'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.send(results)
    })
})

//retrieve advisers  from database
app.get('/advisers',(req,res)=>{
    const q = 'SELECT * FROM adviser'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.send(results)
    })
})

//retrieve type  from database
app.get('/type',(req,res)=>{
    const q = 'SELECT * FROM resourcetype'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.send(results)
    })
})

//retrieve type  from database
app.get('/status',(req,res)=>{
    const q = 'SELECT * FROM status'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.send(results)
    })
})

//get catalog details 
app.get('/catalogdetails/:pagination',(req,res)=>{
    const page = parseInt(req.params.pagination,10
    )

    const q = "SELECT r.resource_id, r.resource_title, r.resource_quantity,rt.type_name,GROUP_CONCAT(CONCAT(a.author_fname, ' ', a.author_lname) SEPARATOR ', ') AS author_names, c.cat_shelf_no FROM resources r JOIN resourceAuthors ra ON r.resource_id = ra.resource_id JOIN author a ON ra.author_id = a.author_id JOIN catalog c ON r.cat_id = c.cat_id JOIN resourcetype rt on rt.type_id = r.type_id GROUP BY r.resource_id, r.resource_title, r.resource_quantity, c.cat_shelf_no,rt.type_name LIMIT 5 OFFSET ?";

    db.query(q,page,(err,results)=>{
        if(err) return res.send(err)
        if(results.length>0){
            return res.send(results)
        }else{
            return res.send('No more records')
        }
            
    })
})

//get specific resource for viewing purposes
app.get('/resource/:resourceId',(req,res)=>{
    console.log('hi')
    const id = req.params.resourceId;

    // check first the type so i know where to store them
    const q = "SELECT type_id FROM resources WHERE resource_id = ?"

    db.query(q,[id],(err,results)=>{
        if(err) return res.send(err)
        const resourceTypeId = results[0].type_id
        console.log(resourceTypeId) //prints the type id
        if(resourceTypeId===1){
            const q = "SELECT * FROM resources WHERE resource_id = ?"
        }
    })
}) 


app.listen(3001,()=>{
    console.log('this is the backend')
})

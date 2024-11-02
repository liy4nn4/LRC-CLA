const version = 4;

//initialize databse
export const initDatabase = (callback) => {
    const request = indexedDB.open("LRCCLA", version);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create "resources" store
        if (!db.objectStoreNames.contains("resources")) {
            const resourcesStore = db.createObjectStore("resources", { keyPath: "resources_id",autoIncrement:true });
        }

        // Create "publisher" store
        if (!db.objectStoreNames.contains("publisher")) {
            const pubStore = db.createObjectStore("publisher", { keyPath: "pub_id",autoIncrement:true });
        }

        // Create "book" store
        if (!db.objectStoreNames.contains("book")) {
            const bookStore = db.createObjectStore("book", { keyPath: "book_id",autoIncrement:true });
        }

        // Create "resourceAuthors" store
        if (!db.objectStoreNames.contains("resourceauthors")) {
            const resourceAuthorsStore = db.createObjectStore("resourceauthors",{keyPath: "ra_id",autoIncrement:true});
        }

        // Create "author" store
        if (!db.objectStoreNames.contains("author")) {
            const authorStore = db.createObjectStore("author", { keyPath: "author_id",autoIncrement:true });
            authorStore.createIndex("author_name",["author_fname","author_lname"],{
                unique:false
            })
        }

        // Create and populate "type" store
        if (!db.objectStoreNames.contains("type")) {
            const typeStore = db.createObjectStore("type", { keyPath: "type_id" });
            typeStore.add({ type_id: 1, type_name: "book" });
            typeStore.add({ type_id: 2, type_name: "journal" });
            typeStore.add({ type_id: 3, type_name: "newsletter" });
            typeStore.add({ type_id: 4, type_name: "thesis" });
        }

        // Create and populate "status" store
        if (!db.objectStoreNames.contains("status")) {
            const statusStore = db.createObjectStore("status", { keyPath: "status_id" });
            statusStore.add({ status_id: 1, status_name: "available" });
            statusStore.add({ status_id: 2, status_name: "lost" });
            statusStore.add({ status_id: 3, status_name: "damaged" });
        }

        // Create and populate "genre" store
        if (!db.objectStoreNames.contains("genre")) {
            const genreStore = db.createObjectStore("genre", { keyPath: "genre_id" });
            genreStore.add({ genre_id: 1, genre_name: "non-fiction" });
            genreStore.add({ genre_id: 2, genre_name: "fiction" });
        }

        // create and populate 'department' store
        if (!db.objectStoreNames.contains("department")) {
            const deptStore = db.createObjectStore("department", { keyPath: "dept_id" });
            deptStore.add({ dept_id: 1, dept_name: "entrepreneurship" });
            deptStore.add({ dept_id: 2, dept_name: "hotel management" });
            deptStore.add({ dept_id: 3, dept_name: "physical education" });
            deptStore.add({ dept_id: 4, dept_name: "languages" });
            deptStore.add({ dept_id: 5, dept_name: "social sciences" });
        }

        // create and populate 'catalog' store
        if (!db.objectStoreNames.contains("catalog")) {
            const catStore = db.createObjectStore("catalog", { keyPath: "cat_id" });
            catStore.add({ cat_id: '1', cat_course_code: "PATHFit1", cat_course_name: "Physical Activities Toward Health and Fitness 1: Movement and Competency Training", cat_description: "This course reintroduces the fundamental movement patterns that consist of non-locomotor and locomotor skills, which are integrated with core training to meet the demands of functional fitness and physical activity performance.", cat_shelf_no: '1' });
            catStore.add({ cat_id: '2', cat_course_code: 'PATHFit2', cat_course_name: 'Physical Activities Toward Health and Fitness 2: Exercise-based Fitness Activities', cat_description: 'This course builds on the foundation of motor skills achieved through core training. It will provide experiences in a variety of exercise programs for the purpose of maintaining and enhancing cardio-respiratory and musculoskeletal fitness (i.e., core stability, muscle strength, endurance and power).', cat_shelf_no: '2'})
            catStore.add({cat_id: '3',cat_course_code: 'PATHFit3',cat_course_name: 'Physical Activities Toward Health and Fitness 3 Dance, Sports, Martial Arts, Group Exercise, Outdoor', cat_description: 'Dance and Sports is a course that will provide physical activities for the purpose of optimizing health and fitness.',cat_shelf_no: '3'})
            catStore.add({cat_id:'4',cat_course_code: 'PATHFit4',cat_course_name: 'Physical Activities Toward Health and Fitness 4 (Physical Activities Toward Health and Fitness 3 Dan',cat_description: 'PATH-FIT 4 Games, Sports, and Outdoor adventure activity as part of the school curriculum is a great opportunity for learners to engage with. ',cat_shelf_no: '4'})
            catStore.add({cat_id:'5',cat_course_code: 'GEC5',cat_course_name: 'Purposive Communication',cat_description: 'Writing, speaking and presenting to different audiences and for various purposes.',cat_shelf_no: '5'})
            catStore.add({cat_id:'6',cat_course_code: 'GEE13B',cat_course_name: 'Philippine Popular Culture',cat_description: 'The course gives emphasis on popular culture through the study of Cultural Studies with a strong focus on culture industry. ',cat_shelf_no: '6'})
            catStore.add({cat_id:'7',cat_course_code: 'GEC1',cat_course_name: 'Understanding the Self',cat_description: 'Nature of identity; factors and forces that affect the development and maintenance of personal identity.',cat_shelf_no: '7'})
            catStore.add({cat_id:'8',cat_course_code: 'GEC2',cat_course_name: 'Readings in Philippine History',cat_description: 'Philippine history viewed from the lens of selected primary sources in different periods, analysis and interpretation.',cat_shelf_no: '8'})
            catStore.add({cat_id:'9',cat_course_code: 'GEC3',cat_course_name: 'The Contemporary World',cat_description: 'Globalization and its impact on individuals, societies and communities, challenges and responses.',cat_shelf_no: '9'})
            catStore.add({cat_id:'10',cat_course_code: 'GEC8',cat_course_name: 'Ethics',cat_description: 'Principles of ethical behavior in modern society at the level of the person, society, and in interaction with the environment and other shared resources.',cat_shelf_no: '10'})
            catStore.add({cat_id:'11',cat_course_code: 'GEE12A',cat_course_name: 'Religions, Religious Experiences and Spirituality',cat_description: 'The course intends to train individuals to look at the subject of religion predominantly from a sociological perspective.',cat_shelf_no: '11'})
            catStore.add({cat_id:'12',cat_course_code: 'GEE12B',cat_course_name: 'Philippine Indigenous Communities',cat_description: 'This course tackles the indigenous groups in the Philippines, their way of life, role and contribution to Filipino society.',cat_shelf_no: '12'})
            catStore.add({cat_id:'13',cat_course_code: 'GEE12C',cat_course_name: 'Gender and Society',cat_description: 'Concepts, principles, and approaches in the understanding of genders in the Philippine towards an effective gender responsive society.',cat_shelf_no: '13'})
            catStore.add({cat_id:'14',cat_course_code: 'GEM14',cat_course_name: 'The Life and Works of Rizal',cat_description: 'As mandated by Republic Act 1425, this course covers the life and works of the country’s national hero, Jose Rizal.',cat_shelf_no: '14'})       
        }
        
        console.log("Database structure created and populated successfully.");
    };

    request.onsuccess = (event) => {
        console.log("Database opened successfully.");
        if(callback) callback()
    };

    request.onerror = (event) => {
        console.error("Database error: ", event.target.errorCode);
    };
};

// Get resource types
export const getTypeOffline = (callback) => {
    const request = indexedDB.open("LRCCLA", version);

    request.onsuccess = (event) => {
        const db = event.target.result;

        if (db.objectStoreNames.contains("type")) {
            const transaction = db.transaction("type", "readonly");
            const storeType = transaction.objectStore("type");
            const types = [];

            storeType.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    types.push(cursor.value);
                    cursor.continue();
                } else {

                    callback(types);
                }
            };

            transaction.onerror = (event) => {
                console.error("Transaction error: ", event.target.error);
            };
        } else {
            console.error("Object store 'type' not found.");
        }
    };

    request.onerror = (event) => {
        console.error("Database error: ", event.target.errorCode);
    };
};

// Get status types
export const getStatusOffline = (callback) => {
    const request = indexedDB.open("LRCCLA", version);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("status", "readonly");
        const storeStatus = transaction.objectStore("status");
        const statuses = [];

        storeStatus.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                statuses.push(cursor.value);
                cursor.continue();
            } else {
                callback(statuses);
            }
        };

        transaction.onerror = (event) => {
            console.error("Transaction error: ", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Database error: ", event.target.errorCode);
    };
};

// Get genres
export const getGenreOffline = (callback) => {
    const request = indexedDB.open("LRCCLA", version);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("genre", "readonly");
        const storeGenre = transaction.objectStore("genre");
        const genres = [];

        storeGenre.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                genres.push(cursor.value);
                cursor.continue();
            } else {
                callback(genres);
            }
        };

        transaction.onerror = (event) => {
            console.error("Transaction error: ", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Database error: ", event.target.errorCode);
    };
};

// Get department
export const getDepartmentOffline = (callback) => {
    const request = indexedDB.open("LRCCLA", version);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("department", "readonly");
        const storeDept = transaction.objectStore("department");
        const depts = [];

        storeDept.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                depts.push(cursor.value);
                cursor.continue();
            } else {
                callback(depts);
            }
        };

        transaction.onerror = (event) => {
            console.error("Transaction error: ", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Database error: ", event.target.errorCode);
    };
};

// Get publishers
export const getPublishersOffline =  (callback) => {
    const request = indexedDB.open("LRCCLA", version);
    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("publisher", "readonly");
        const publisherStore = transaction.objectStore("publisher");

        // Get all publishers
        const getAllRequest = publisherStore.getAll();
        getAllRequest.onsuccess = () => {
            const publishers = getAllRequest.result.map((publisher) => ({
                value: publisher.pub_id,
                label: publisher.pub_name,
            }));
            callback(publishers); // Update dropdown options immediately
        };

        getAllRequest.onerror = (event) => {
            console.error("Error fetching publishers:", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Error opening database:", event.target.error);
    };
};

// Get catalog
export const getCatalogOffline = (callback) => {
    const request = indexedDB.open("LRCCLA", version);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("catalog", "readonly");
        const storeCat = transaction.objectStore("catalog");
        const catalog = [];

        storeCat.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                catalog.push(cursor.value);
                cursor.continue();
            } else {
                callback(catalog);
            }
        };

        transaction.onerror = (event) => {
            console.error("Transaction error: ", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Database error: ", event.target.errorCode);
    };
};

// Post data on resources table
export const saveResourcesOffline = (resources) => {
    const request = indexedDB.open("LRCCLA", version);
    const authors = resources.authors;
    const mediaType = resources.mediaType; //either book,journal,newsletter, and thesis
    let existingPublisher;

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("resources", "readwrite");
        const resourcesStore = transaction.objectStore("resources");

        const addResource = resourcesStore.add({
            resource_title: resources.title,
            resource_description: resources.description,
            resource_published_date: resources.publishedDate,
            resource_quantity: resources.quantity,
            resource_is_circulation: resources.isCirculation,
            dept_id: resources.department,
            cat_id: resources.course,
            type_id: resources.mediaType,
            status_id: resources.status
        });

        // Store resource ID of the new resource
        addResource.onsuccess = async (event) => {
            const resourceId = event.target.result;
            console.log("Resource ID:", resourceId);

            // Prepare authors for storing
            //authorPromises is an array
            //async function lets you use await
            //using an async before a function makes the function return a promise
            //await keyword can only be used inside the async
            //The await keyword makes the function pause the execution and wait for a resolved promise before it continues
            const authorPromises = authors.map(async (element) => {
                const nameParts = element.split(' ');
                const fname = nameParts[0]; // Author first name
                const lname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''; // Last name

                // Pass fname and lname to saveAuthorsOffline()
                return await saveAuthorsOffline(fname, lname, resourceId);
            });

            console.log(authorPromises)

            // Wait for all authors to be saved
            try {
                // Promise.all(authorPromises): Promise.all() takes an array of promises (authorPromises in this case) and returns a single promise. This returned promise resolves only when all promises in the array have resolved. If any of the promises in the array reject, Promise.all() immediately rejects with that error, and no further promises are waited on
                //await:await pauses the execution of the surrounding async function until the promise returned by Promise.all() resolves.It ensures that you don’t move to the next line of code until all promises in authorPromises have either successfully completed or an error occurs.
                await Promise.all(authorPromises);
                console.log("All authors saved successfully.");
                //check what media type (book,journal,newsletter,or thesis)
                if(mediaType=='1'){
                    existingPublisher = resources.publisher_id
                    checkPublisherExist(existingPublisher).then((pubId)=>{
                        const book = {
                            book_cover:resources.file,
                            book_isbn:resources.isbn,
                            resource_id:resourceId,
                            pub_id:pubId
                        }
                        saveBookOffline(book)
                    })
                    .catch(()=>{
                        //insert publisher
                        const publisher = {
                            pub_name:resources.publisher, pub_address:resources.publisher_address, pub_email: resources.publisher_email,
                            pub_phone: resources.publisher_number,
                            pub_website: resources.publisher_website
                        }
                        savePublishersOffline(publisher).then((pubId)=>{
                            const book = {
                                book_cover:resources.file,
                                book_isbn:resources.isbn,
                                resource_id:resourceId,
                                pub_id:pubId
                            }
                            saveBookOffline(book)
                        })
                    })
                }
            } catch (error) {
                console.error("Error saving authors:", error);
            }
        };


        addResource.onerror = (event) => {
            console.error("Error adding resource:", event.target.error);
        };

        transaction.oncomplete = () => {
            console.log("Transaction completed: Resource Inserted Successfully");
        };

        transaction.onerror = (event) => {
            console.error("Transaction failed:", event.target.error);
        };
    };

    request.onerror = (event) => {
        console.error("Error opening database:", event.target.error);
    };
}

export const saveBookOffline=(book)=>{
    const request = indexedDB.open("LRCCLA", version);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("book", "readwrite");
            const bookStore = transaction.objectStore("book");

            bookStore.add(book)
        }
}

// Ensure saveAuthorsOffline returns a Promise
export const saveAuthorsOffline = (fname, lname, resourceId) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("LRCCLA", version);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("author", "readwrite");
            const authorStore = transaction.objectStore("author");
            const authorIndex = authorStore.index("author_name");

            // Check if the author already exists in the author object store
            const authorQuery = authorIndex.get([fname, lname]);

            // Successful execution of the query
            authorQuery.onsuccess = (event) => {
                const author = event.target.result;

                // If found, get the author_id to insert into resourceAuthors table
                if (author) {
                    console.log("Author found:", author); // Author was found
                    const authorId = author.author_id;
                    saveResourceAuthors(resourceId, authorId)
                        .then(resolve)
                        .catch(reject);
                } else {
                    // Author not found, add new author to the author object store
                    const addAuthor = authorStore.add({ author_lname: lname, author_fname: fname });

                    addAuthor.onsuccess = (event) => {
                        const authorId = event.target.result;
                        saveResourceAuthors(resourceId, authorId)
                            .then(resolve)
                            .catch(reject);
                    };

                    addAuthor.onerror = (event) => {
                        console.error("Error adding author:", event.target.error);
                        reject(event.target.error);
                    };
                }
            };

            authorQuery.onerror = (event) => {
                console.error("Error querying author:", event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = (event) => {
            console.error("Error opening database:", event.target.error);
            reject(event.target.error);
        };
    });
}

export const saveResourceAuthors = (resourceId, authorId) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("LRCCLA", version);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("resourceauthors", "readwrite");
            const resourceAuthorsStore = transaction.objectStore("resourceauthors");

            const addResourceAuthor = resourceAuthorsStore.add({ resource_id: resourceId, author_id: authorId });

            addResourceAuthor.onsuccess = () => {
                console.log("ResourceAuthor saved successfully:", { resource_id: resourceId, author_id: authorId });
                resolve();
            };

            addResourceAuthor.onerror = (event) => {
                console.error("Error adding resource author:", event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = (event) => {
            console.error("Error opening database:", event.target.error);
            reject(event.target.error);
        };
    });
}

export const savePublishersOffline = (publisher)=>{
    return new Promise((resolve,reject)=>{
        const request = indexedDB.open("LRCCLA", version);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("publisher", "readwrite");
            const pubStore = transaction.objectStore("publisher");

            const addPub = pubStore.add(publisher)

            //store inserted pub_id
            addPub.onsuccess = async(event)=>{
                const pubId = event.target.result
                resolve(pubId)
            }
        }
    })
    
}

export const checkPublisherExist = (existingPublisher)=>{
    return new Promise((resolve,reject)=>{
        const request = indexedDB.open("LRCCLA", version);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("publisher", "readonly");
            const pubStore = transaction.objectStore("publisher");

            const getRequest = pubStore.get(existingPublisher);

            getRequest.onsuccess = (event) => {
                const publisher = event.target.result;
                if (publisher) {
                    console.log("Publisher found:", publisher);
                    resolve(publisher.pub_id)
                } else {
                    console.log("No Publisher found with the given ID.");
                    reject()
                }
            };
        }

    })
}
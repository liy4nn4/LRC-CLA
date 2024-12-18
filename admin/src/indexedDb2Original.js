import { openDB } from "idb"

const dbName = "LRCCLA";
const version = 1;

//initialize databse
export const initDB = async () => {
    return openDB (dbName, version,{
        upgrade(db){
            // Create "resources" store
        if (!db.objectStoreNames.contains("resources")) {
            const resourcesStore = db.createObjectStore("resources", { keyPath: "resource_id",autoIncrement:true });
            resourcesStore.createIndex("sync_status", "sync_status", { unique: false });
        }

        // Create "journalnewsletter" store
        if (!db.objectStoreNames.contains("journalnewsletter")) {
            const jnStore = db.createObjectStore("journalnewsletter", { keyPath: "jn_id",autoIncrement:true });
            jnStore.createIndex("sync_status", "sync_status", { unique: false });
            jnStore.createIndex("resource_id", "resource_id", { unique: false });
        }

        // Create "publisher" store
        if (!db.objectStoreNames.contains("publisher")) {
            const pubStore = db.createObjectStore("publisher", { keyPath: "pub_id", autoIncrement: true });
            pubStore.createIndex("sync_status", "sync_status", { unique: false });
            
            setPredefinedData('publisher',{
                            pub_name: "n/a",
                            pub_address: "n/a",
                            pub_email: "n/a",
                            pub_phone: "n/a",
                            pub_website: "n/a"
                        })
            
          }

        // Create "book" store
        if (!db.objectStoreNames.contains("book")) {
            const bookStore = db.createObjectStore("book", { keyPath: "book_id",autoIncrement:true });
            bookStore.createIndex("sync_status", "sync_status", { unique: false });
            bookStore.createIndex("resource_id", "resource_id", { unique: false });
        }

        // Create "thesis" store
        if (!db.objectStoreNames.contains("thesis")) {
            const thesisStore = db.createObjectStore("thesis", { keyPath: "thesis_id",autoIncrement:true });
            thesisStore.createIndex("sync_status", "sync_status", { unique: false });
            thesisStore.createIndex("resource_id", "resource_id", { unique: false });
        }

        // Create "adviser" store
        if (!db.objectStoreNames.contains("adviser")) {
            const adviserStore = db.createObjectStore("adviser", { keyPath: "adviser_id",autoIncrement:true });
            adviserStore.createIndex("adviser_name",["adviser_fname","adviser_lname"],{
                unique:false
            })
            adviserStore.createIndex("sync_status", "sync_status", { unique: false });
        }

        // Create "resourceAuthors" store
        if (!db.objectStoreNames.contains("resourceauthors")) {
            const resourceAuthorsStore = db.createObjectStore("resourceauthors",{keyPath: "ra_id",autoIncrement:true});
            resourceAuthorsStore.createIndex("sync_status", "sync_status", { unique: false });
            resourceAuthorsStore.createIndex("resource_id", "resource_id", { unique: false });
        }

        // Create "author" store
        if (!db.objectStoreNames.contains("author")) {
            const authorStore = db.createObjectStore("author", { keyPath: "author_id",autoIncrement:true });
            authorStore.createIndex("author_name",["author_fname","author_lname"],{
                unique:false
            })
            authorStore.createIndex("sync_status", "sync_status", { unique: false });
             setPredefinedData('author',{
                            author_fname: 'n/a',
                            author_lname: 'n/a'
                        })
        }

        // Create and populate "type" store
        if (!db.objectStoreNames.contains("resourcetype")) {
            const typeStore = db.createObjectStore("resourcetype", { keyPath: "type_id", autoIncrement: true});
            typeStore.add({ type_name: "book" });
            typeStore.add({ type_name: "journal" });
            typeStore.add({ type_name: "newsletter" });
            typeStore.add({ type_name: "thesis" });
        }

        // Create and populate "availability" store
        if (!db.objectStoreNames.contains("availability")) {
            const availStore = db.createObjectStore("availability", { keyPath: "avail_id",autoIncrement: true });
            availStore.add({ avail_name: "available" });
            availStore.add({ avail_name: "lost" });
            availStore.add({ avail_name: "damaged" });
        }

        // create and populate 'department' store
        if (!db.objectStoreNames.contains("department")) {
            const deptStore = db.createObjectStore("department", { keyPath: "dept_id", autoIncrement: true });
            deptStore.add({dept_name: "social science", dept_shelf_no: '1' });
            deptStore.add({dept_name: "languages", dept_shelf_no: '2' });
            deptStore.add({dept_name: "business management ", dept_shelf_no: '3' });
            deptStore.add({dept_name: "hospitality management", dept_shelf_no: '4' });
            deptStore.add({dept_name: "references", dept_shelf_no: '5' });
            deptStore.add({dept_name: "student output", dept_shelf_no: '6' });
            deptStore.add({dept_name: "thesis", dept_shelf_no: '7' });
        }

        // create and populate 'topic' store
        if (!db.objectStoreNames.contains("topic")) {
            const topicStore = db.createObjectStore("topic", { keyPath: "topic_id", autoIncrement: true });
            topicStore.add({topic_name: "information and organizational management", topic_row_no: '1' });
            topicStore.add({topic_name: "operational management", topic_row_no: '2' });
            topicStore.add({topic_name: "financial management", topic_row_no: '3' });
            topicStore.add({topic_name: "accounting", topic_row_no: '4' });
            topicStore.add({topic_name: "business and human resource", topic_row_no: '5' });
            topicStore.add({topic_name: "marketing", topic_row_no: '6' });
            topicStore.add({topic_name: "philippine history and rizal", topic_row_no: '1' });
            topicStore.add({topic_name: "psychology", topic_row_no: '2' });
            topicStore.add({topic_name: "politics and government", topic_row_no: '3' });
            topicStore.add({topic_name: "sociology and anthropology", topic_row_no: '4' });
            topicStore.add({topic_name: "philosophy and ethics", topic_row_no: '5' });
            topicStore.add({topic_name: "writing", topic_row_no: '1' });
            topicStore.add({topic_name: "communication", topic_row_no: '2' });
            topicStore.add({topic_name: "literature", topic_row_no: '3' });
        }  
        }
    })
};

//create predefined data in publisher
export const setPredefinedData=async(storeName,data)=>{
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.put(data)
    await tx.done
}

// Get all data from a store
export const getAllFromStore = async (storeName) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return await store.getAll();
};

// Get all unsynced data from a store
export const getAllUnsyncedFromStore = async (storeName) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index('sync_status')

    // Get all records where `sync_status` is `false`
    return await index.getAll(0);
};

// Get all unsynced data from a store
export const markAsSynced = async (storeName,id) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    
    // returns object that matches the id
    const record = await store.get(id);
    if (record) {
        record.sync_status = 1; // Update sync status
        await store.put(record);
    }

    await tx.done;
};

/*----------------------SAVE RESOURCES-----------------*/
export const saveResourceOffline = async(data)=>{
    const mediaType = data.mediaType;
    let existingPublisher;
    let pub_name;
    let pub_add;
    let pub_email;
    let pub_phone;
    let pub_website;

    let adviserFname;
    let adviserLname;

    //set variables depending on type
    if(mediaType==='1'){
        existingPublisher = data.publisher_id; //this is not 0 if pinili niya ay existing na publisher
        pub_name = data.publisher;
        pub_add = data.publisher_address;
        pub_email = data.publisher_email;
        pub_phone = data.publisher_number;
        pub_website = data.publisher_website;
    }else if(mediaType==='4'){
        // split string
        //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
        const adviser = data.adviser.split(' ')
        adviserFname = adviser.slice(0, -1).join(" ");
        adviserLname = adviser.length > 1 ? adviser[adviser.length - 1] : '';
    }

    const db = await initDB();
    const tx = db.transaction("resources", "readwrite");
    const store = tx.objectStore("resources");

    // resource
    const resource = {
        resource_title: data.title,
        resource_description: data.description,
        resource_published_date: data.publishedDate,
        resource_quantity: data.quantity,
        resource_is_circulation: data.isCirculation?1:0,
        dept_id: data.department,
        topic_id: data.topic,
        type_id: data.mediaType,
        avail_id: data.status,
        sync_status: 0
    }

    // Save the resource and get the inserted ID
    const resourceId = await store.put(resource);
    await tx.done;
    console.log(`Data saved in resources object store`);

    const authors = data.authors
    console.log('author',authors)
    //pass resourceId and authors to saveAuthorsOffline
    await saveAuthorsOffline(resourceId, authors).then(async ()=>{
        //insert data based on their type
        if(mediaType==='1'){
            //check publisher
            if(existingPublisher==0&&!pub_name&&!pub_add&&!pub_email&&!pub_phone&&!pub_website){
                // if publisherid is 0 and walang nakaset sa pub details, insert to book then sed pub_id to nulll
                await saveBookOffline(data.file, data.isbn, resourceId,null)
            }else{
                //if hindi 0 ung publisherID, check sa publisher id nageexist un
                try {
                    await checkPublisherIfExist(existingPublisher);
                    await saveBookOffline(data.file, data.isbn, resourceId, existingPublisher);
                } catch {
                    const pubId = await savePublisherOffline(pub_name, pub_add, pub_email, pub_phone, pub_website);
                    await saveBookOffline(data.file, data.isbn, resourceId, pubId);
                }
            }
        }else if(mediaType==='2'||mediaType==='3'){
            await saveJournalNewsletterOffline(data.volume,data.issue,data.file,resourceId)
        }else{
            await checkAdviserIfExist(adviserFname,adviserLname,resourceId)
        }
    })
}

const checkAdviserIfExist = async(adviserFname, adviserLname,resourceId)=>{
    const db = await initDB();
    const tx = db.transaction('adviser','readwrite');
    const store = tx.objectStore('adviser');
    const index = store.index('adviser_name')

    const result = await index.get([adviserFname,adviserLname]);

    if(!result){
        //if adviser does nt exist, insert to adviser object store
        const adviserId =  await store.put({adviser_fname: adviserFname, adviser_lname: adviserLname, sync_status:0});

        //after inserting, pass to saveThesisOffline()
        await saveThesisOffline(adviserId,resourceId)
    }else{
        //if nahanap
        const adviserId = result.adviser_id;
        await saveThesisOffline(adviserId,resourceId)
    }

}

const saveThesisOffline = async (adId,resId)=>{
    const db = await initDB()
    const tx = db.transaction('thesis','readwrite')
    const store = tx.objectStore('thesis')
    await store.put({
        resource_id:resId,
        adviser_id:adId,
        sync_status:0
    })
    await tx.done
}

const saveJournalNewsletterOffline = async(jnVol, jnIssue, jnCover, resourceId)=>{
    const db = await initDB()
    const tx = db.transaction('journalnewsletter','readwrite');
    const store = tx.objectStore('journalnewsletter')
    await store.put({
        jn_volume:jnVol,
        jn_issue:jnIssue,
        file: jnCover,
        resource_id:resourceId,
        sync_status: 0
    })
    await tx.done
}

const savePublisherOffline = async(pubName, pubAdd, pubEmail, pubPhone, pubWeb) =>{
     const db = await initDB();
    const tx = db.transaction('publisher', 'readwrite');
    const store = tx.objectStore('publisher');
    const pubId = await store.put({
        pub_name: pubName,
        pub_add: pubAdd,
        pub_email: pubEmail,
        pub_phone: pubPhone,
        pub_website: pubWeb,
        sync_status:0
    });
    await tx.done;
    return pubId;
}

const checkPublisherIfExist = async (pubId)=>{
    const db = await initDB();
    const tx = db.transaction('publisher', 'readonly');
    const store = tx.objectStore('publisher');
    const result = await store.get(pubId);

    if (!result) {
        throw new Error('Publisher not found');
    }
    return result;
}

const saveBookOffline = async (file,isbn,resourceId,pubId)=>{
    const db = await initDB()
    const tx = db.transaction('book','readwrite');
    const store = tx.objectStore('book')
    await store.put({
        file:file,
        book_isbn:!isbn?null:isbn,
        resource_id:resourceId, 
        pub_id:pubId,
        sync_status:0
    })
    await tx.done
}

const saveAuthorsOffline = async (resourceId, authors) => {
    const db = await initDB();
    if(authors.length!=0){
        // Loop through authors to check if they exist and add them if not
        for (let element of authors) {
            // Use 'readwrite' since you're potentially adding or modifying records
            const tx = db.transaction("author", "readwrite");
            const store = tx.objectStore("author");
            const index = store.index("author_name");

            const nameParts = element.split(' ');
            const fname = nameParts.slice(0, -1).join(" ");  // "John Michael"
            const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''; // "Doe"

            const authorValue = [fname, lname];  // Create the key to search in the index
            console.log(authorValue)

            // Check if the author exists in the index
            const result = await index.get(authorValue);
            console.log(result)
            //if walang nakitang author, insert author
            if(!result){
                //Save the author and get the inserted ID
                const authorId =  await store.put({
                    author_fname: fname, 
                    author_lname: lname, 
                    sync_status: 0});

                //after inserting, pass the resourceId and authorId to saveResourceAuthorOffline()
                await saveResourceAuthorOffline(resourceId,authorId)
            }else{
                //if may nahanap, get the authorId and pass to saveResourceAuthorOffline(resourceId,authorId) together with the resourceId
                //result: {author_fname: 'sample', author_lname: 'sample', author_id: 1}
                const authorId = result.author_id
                await saveResourceAuthorOffline(resourceId,authorId)
            }
            await tx.done;  // Ensure the transaction completes
        }
        console.log("inserted to author and resourceauthor object store.");
    }
    
};

const saveResourceAuthorOffline = async (resourceId,authorId)=>{
    const db = await initDB()
    const tx = db.transaction("resourceauthors", "readwrite");
    const store = tx.objectStore("resourceauthors");

    await store.put({resource_id: resourceId, author_id: authorId, sync_status:0})
    await tx.done;
}

/*----------------------SAVE RESOURCES END-----------------*/

//displays resources in catalog page
export const getCatalogOffline = async (setCatalog)=>{
    const db = await initDB()
    const catalog = [];

    //get resourceauthor
    const txResourceAuthor = db.transaction('resourceauthors','readonly');
    const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
    const resourceAuthorsList = await resourceAuthorStore.getAll()
    await txResourceAuthor.done

    //get all resources
    const txResource = db.transaction('resources','readonly')
    const resourceStore = txResource.objectStore('resources')
    const resources = await resourceStore.getAll()
    await txResource.done

    //get related type
    const txType = db.transaction('resourcetype','readonly');
    const typeStore = txType.objectStore('resourcetype');
    const types = await typeStore.getAll()
    await txType.done
    
    //get related author
    const txAuthor = db.transaction('author','readonly');
    const authorStore = txAuthor.objectStore('author')
    const authors = await authorStore.getAll()
    await txAuthor.done

    //get department for the shelf no
    const txDept = db.transaction('department','readonly');
    const deptStore = txDept.objectStore('department')
    const department = await deptStore.getAll()
    await txDept.done
    

    for(const resource of resources){
        //.find() returns the entire object if it finds a match.
        //resource type
        const resourceType = types.find(type => type.type_id == resource.type_id)?.type_name || '';

        //resource shelf no
        const shelfNo = department.find(dept=>dept.dept_id == resource.dept_id)?.dept_shelf_no||'';

        //get authors 
        //filter returns whole objet that matches the condition
        //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
        const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);

        //get resource author
        // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
        const resourceAuthors = authors
            .filter(author => resourceAuthorId.includes(author.author_id))
            .map(author => `${author.author_fname} ${author.author_lname}`)


        catalog.push({
            resource_id: resource.resource_id,
            resource_title: resource.resource_title,
            type_name: resourceType,
            author_names: resourceAuthors.length>1?resourceAuthors.join(', '):resourceAuthors,
            dept_shelf_no: shelfNo,
            resource_quantity: resource.resource_quantity
        })

        console.log(resourceAuthors)
    }
    setCatalog(catalog) 
}

/*----------------------VIEW RESOURCES-----------------*/
//for viewing specific resource in admin side
export const viewResourcesOffline =async(resourceId,setBookData)=>{
    const db = await initDB();

    // get type id of resource
    const txResource = db.transaction('resources','readonly');
    const resourceStore = txResource.objectStore('resources');
    const resource = await resourceStore.get(resourceId)
    const resourceType = resource.type_id;
    await txResource.done

    switch(resourceType){
        case '1':
            await viewBookOffline(resource,setBookData)
            break;
        case '2':
        case '3':
            await viewJournalNewsletterOffline(resource,setBookData);
            break;
        case '4':
            await viewThesisOffline(resource,setBookData);
            break;
        default:
            console.log('Media type not allowed')
    }
}

const viewBookOffline = async (resource,setBookData)=>{
    const db = await initDB();

     //get resourceauthor
    const txResourceAuthor = db.transaction('resourceauthors','readonly');
    const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
    const resourceAuthorsList = await resourceAuthorStore.getAll()
    await txResourceAuthor.done
     
     //get related author
     const txAuthor = db.transaction('author','readonly');
     const authorStore = txAuthor.objectStore('author')
     const authors = await authorStore.getAll()
     await txAuthor.done

     //authors
     //get authors 
     // //filter returns whole objet that matches the condition
     // //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
    const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);

    //get resource author
    // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
    const resourceAuthors = authors
    .filter(author => resourceAuthorId.includes(author.author_id))
    .map(author => `${author.author_fname} ${author.author_lname}`)

     //get related book
     const txBook = db.transaction('book','readonly');
     const bookStore = txBook.objectStore('book')
     const books = await bookStore.getAll()
     await txBook.done

     //get book details of resource
     const bookDetails = books.find(book=>book.resource_id == resource.resource_id);

     //get related publisher
     const txPub = db.transaction('publisher','readonly');
     const pubStore = txPub.objectStore('publisher')
     let publisher;
     if(bookDetails.pub_id){
        publisher = await pubStore.get(bookDetails.pub_id)
     }else{
        publisher = null;
     }
     
     await txBook.done

     setBookData((prevdata)=>({
        ...prevdata,
        mediaType: resource.type_id,
        authors: resourceAuthors,
        description: resource.resource_description,
        quantity:resource.resource_quantity,
        title: resource.resource_title,
        isbn: bookDetails.book_isbn,
        status:resource.avail_id,
        publisher_id: bookDetails.pub_id,
        publisher: publisher?publisher.pub_name:'',
        file: bookDetails.file,
        publishedDate: resource.resource_published_date,
        department: resource.dept_id,
        topic: resource.topic_id,
        isCirculation:resource.resource_is_circulation==0?false:true
     }))
}

const viewJournalNewsletterOffline = async (resource,setBookData)=>{
    const db = await initDB();

     //get resourceauthor
     const txResourceAuthor = db.transaction('resourceauthors','readonly');
     const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
     const resourceAuthorsList = await resourceAuthorStore.getAll()
     await txResourceAuthor.done
      
      //get related author
      const txAuthor = db.transaction('author','readonly');
      const authorStore = txAuthor.objectStore('author')
      const authors = await authorStore.getAll()
      await txAuthor.done
 
      //authors
      //get authors 
      // //filter returns whole objet that matches the condition
      // //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
     const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);
 
     //get resource author
    // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
    const resourceAuthors = authors
    .filter(author => resourceAuthorId.includes(author.author_id))
    .map(author => `${author.author_fname} ${author.author_lname}`)

    //get related journalnewsletter
    const txJn = db.transaction('journalnewsletter','readonly');
    const jnStore = txJn.objectStore('journalnewsletter')
    const jns = await jnStore.getAll()
    await txJn.done

    //get book details of resource
    const jnDetails = jns.find(jn=>jn.resource_id == resource.resource_id);

    setBookData((prevdata)=>({
        ...prevdata,
        mediaType: resource.type_id,
        authors: resourceAuthors,
        description: resource.resource_description,
        quantity:resource.resource_quantity,
        title: resource.resource_title,
        status:resource.avail_id,
        file: jnDetails.file,
        publishedDate: resource.resource_published_date,
        department: resource.dept_id,
        topic: resource.topic_id,
        volume: jnDetails.jn_volume,
        issue: jnDetails.jn_issue,
        isCirculation:resource.resource_is_circulation==0?false:true
     }))
}

const viewThesisOffline = async (resource,setBookData)=>{
    const db = await initDB();

     //get resourceauthor
     const txResourceAuthor = db.transaction('resourceauthors','readonly');
     const resourceAuthorStore = txResourceAuthor.objectStore('resourceauthors')
     const resourceAuthorsList = await resourceAuthorStore.getAll()
     await txResourceAuthor.done
      
      //get related author
      const txAuthor = db.transaction('author','readonly');
      const authorStore = txAuthor.objectStore('author')
      const authors = await authorStore.getAll()
      await txAuthor.done
 
      //authors
      //get authors 
      // //filter returns whole objet that matches the condition
      // //map returns the author id, therefore resoureAuthorId is an array that holds the id of authors
     const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);
 
     //get resource author
    // filter returns the object of author (yung my lname and fname kapag yung author_id ay nag-eexist sa resourceAuthorId)
    const resourceAuthors = authors
    .filter(author => resourceAuthorId.includes(author.author_id))
    .map(author => `${author.author_fname} ${author.author_lname}`)

    //get related journalnewsletter
    const txThesis = db.transaction('thesis','readonly');
    const thesisStore = txThesis.objectStore('thesis')
    const theses = await thesisStore.getAll()
    await txThesis.done

    //get book details of resource
    const thesisDetails = theses.find(thesis=>thesis.resource_id == resource.resource_id);

    //get related adviser 
    const txAdviser = db.transaction('adviser','readonly');
    const adviserStore = txAdviser.objectStore('adviser')
    const adviser = await adviserStore.get(thesisDetails.adviser_id)
    await txAdviser.done

    setBookData((prevdata)=>({
        ...prevdata,
        mediaType: resource.type_id,
        authors: resourceAuthors,
        adviser: `${adviser.adviser_fname} ${adviser.adviser_lname}`,
        description: resource.resource_description,
        quantity:resource.resource_quantity,
        title: resource.resource_title,
        status:resource.avail_id,
        publishedDate: resource.resource_published_date,
        department: resource.dept_id,
        topic: resource.topic_id,
        isCirculation:resource.resource_is_circulation==0?false:true
     }))

}
/*----------------------VIEW RESOURCES END-----------------*/

/*----------------------EDIT RESOURCES-----------------*/
export const editResourceOffline = async (data,id)=>{
    const resourceId = parseInt(id)
    const mediaType = data.mediaType;
    let existingPublisher;
    let pub_name;
    let pub_add;
    let pub_email;
    let pub_phone;
    let pub_website;

    let adviserFname;
    let adviserLname;

    //set variables depending on type
    if(mediaType==='1'){
        existingPublisher = data.publisher_id; //this is not 0 if pinili niya ay existing na publisher
        pub_name = data.publisher;
        pub_add = data.publisher_address;
        pub_email = data.publisher_email;
        pub_phone = data.publisher_number;
        pub_website = data.publisher_website;
    }else if(mediaType==='4'){
        // split string
        //if req.body.adviser is 'name lastname'. pag ginamitan ng split(' ') it will be ['name','lastname']
        const adviser = data.adviser.split(' ')
        adviserFname = adviser.slice(0, -1).join(" ");
        adviserLname = adviser.length > 1 ? adviser[adviser.length - 1] : '';
    }

    const db = await initDB();
    const tx = db.transaction("resources", "readwrite");
    const store = tx.objectStore("resources");

    const updatedResource = {
        resource_id: resourceId,
        resource_title: data.title,
        resource_description: data.description,
        resource_published_date: data.publishedDate,
        resource_quantity: data.quantity,
        resource_is_circulation: data.isCirculation?1:0,
        dept_id: data.department,
        topic_id: data.topic,
        type_id: data.mediaType,
        avail_id: data.status,
        sync_status: 0
    }
    
    await store.put(updatedResource);
    await tx.done

    const authors = data.authors;

    await editAuthorsOffline(resourceId, authors).then(async ()=>{
        //insert data based on their type
        if(mediaType==='1'){
            //check publisher
            if(existingPublisher==0&&!pub_name&&!pub_add&&!pub_email&&!pub_phone&&!pub_website){
                // if publisherid is 0 and walang nakaset sa pub details, insert to book then sed pub_id to nulll
                await editBookOffline(data.file, data.isbn, resourceId,null)
            }else{
                //if hindi 0 ung publisherID, check sa publisher id nageexist un
                try {
                    await checkPublisherIfExist(existingPublisher);
                    await editBookOffline(data.file, data.isbn, resourceId, existingPublisher);
                } catch {
                    const pubId = await savePublisherOffline(pub_name, pub_add, pub_email, pub_phone, pub_website);
                    await saveBookOffline(data.file, data.isbn, resourceId, pubId);
                }
            }
        }else if(mediaType==='2'||mediaType==='3'){
            await editJournalNewsletterOffline(data.volume,data.issue,data.file,resourceId)
        }else{
            await editCheckAdviserIfExist(adviserFname,adviserLname,resourceId)
        }
    })
}

const editAuthorsOffline = async (resourceId, authors) => {
    const db = await initDB();
    // Loop through authors to check if they exist and add them if not
    for (let element of authors) {
        // Use 'readwrite' since you're potentially adding or modifying records
        const tx = db.transaction("author", "readwrite");
        const store = tx.objectStore("author");
        const index = store.index("author_name");

        const nameParts = element.split(' ');
        const fname = nameParts.slice(0, -1).join(" ");  // "John Michael"
        const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''; // "Doe"

        const authorValue = [fname, lname];  // Create the key to search in the index
        console.log(authorValue)

        // Check if the author exists in the index
        const result = await index.get(authorValue);
        console.log(result)
        //if walang nakitang author, insert author
        if(!result){
            //Save the author and get the inserted ID
            const authorId =  await store.put({
                author_fname: fname, 
                author_lname: lname, 
                sync_status: 0});

            //after inserting, pass the resourceId and authorId to saveResourceAuthorOffline()
            await editResourceAuthorOffline(resourceId,authorId)
        }else{
            //if may nahanap, get the authorId and pass to saveResourceAuthorOffline(resourceId,authorId) together with the resourceId
            //result: {author_fname: 'sample', author_lname: 'sample', author_id: 1}
            const authorId = result.author_id
            await editResourceAuthorOffline(resourceId,authorId)
        }
        await tx.done;  // Ensure the transaction completes
    }
    console.log("inserted to author and resourceauthor object store.");
};

const editBookOffline = async (file,isbn,resourceId,pubId)=>{
    const db = await initDB()
    const tx = db.transaction('book','readwrite');
    const store = tx.objectStore('book')
    const index = store.index('resource_id')

    const book = await index.get(resourceId)
    //get book that matches resourceId and delete

    await store.put({
        book_id: book.book_id,
        file:file,
        book_isbn:isbn,
        resource_id:resourceId, 
        pub_id:pubId,
        sync_status:0
    })
    await tx.done
}

const editResourceAuthorOffline = async (resourceId,authorId)=>{
    const db = await initDB()
    const tx = db.transaction("resourceauthors", "readwrite");
    const store = tx.objectStore("resourceauthors");
    const index = store.index("resource_id")

    const ra = await index.get(resourceId)
    await store.delete(ra.ra_id)

    await store.put({resource_id: resourceId, author_id: authorId, sync_status:0})
    await tx.done;
}

const editJournalNewsletterOffline = async(jnVol, jnIssue, jnCover, resourceId)=>{
    const db = await initDB()
    const tx = db.transaction('journalnewsletter','readwrite');
    const store = tx.objectStore('journalnewsletter');
    const index = store.index('resource_id');

    //retrieve jn that matches the resourceID
    const jn = await index.get(resourceId)

    await store.put({
        jn_id: jn.jn_id,
        jn_volume:jnVol,
        jn_issue:jnIssue,
        file: jnCover,
        resource_id:resourceId,
        sync_status: 0
    })
    await tx.done
}

const editCheckAdviserIfExist = async(adviserFname, adviserLname,resourceId)=>{
    const db = await initDB();
    const tx = db.transaction('adviser','readwrite');
    const store = tx.objectStore('adviser');
    const index = store.index('adviser_name')

    const result = await index.get([adviserFname,adviserLname]);

    if(!result){
        //if adviser does nt exist, insert to adviser object store
        const adviserId =  await store.put({adviser_fname: adviserFname, adviser_lname: adviserLname, sync_status:0});

        //after inserting, pass to saveThesisOffline()
        await editThesisOffline(adviserId,resourceId)
    }else{
        //if nahanap
        const adviserId = result.adviser_id;
        await editThesisOffline(adviserId,resourceId)
    }
}

const editThesisOffline = async (adId,resId)=>{
    const db = await initDB()
    const tx = db.transaction('thesis','readwrite')
    const store = tx.objectStore('thesis')
    const index = store.index('resource_id')

    // retrive thesis that matches the resource_id
    const thesis = await index.get(resId);
    
    await store.put({
        thesis_id: thesis.thesis_id,
        resource_id:resId,
        adviser_id:adId,
        sync_status:0
    })
    await tx.done
}
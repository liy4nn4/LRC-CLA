import { openDB } from "idb"

const dbName = "LRCCLA";
const version = 5;

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
        }

        // Create "publisher" store
        if (!db.objectStoreNames.contains("publisher")) {
            const pubStore = db.createObjectStore("publisher", { keyPath: "pub_id",autoIncrement:true });
        }

        // Create "book" store
        if (!db.objectStoreNames.contains("book")) {
            const bookStore = db.createObjectStore("book", { keyPath: "book_id",autoIncrement:true });
        }

        // Create "thesis" store
        if (!db.objectStoreNames.contains("thesis")) {
            const thesisStore = db.createObjectStore("thesis", { keyPath: "thesis_id",autoIncrement:true });
        }

        // Create "adviser" store
        if (!db.objectStoreNames.contains("adviser")) {
            const adviserStore = db.createObjectStore("adviser", { keyPath: "adviser_id",autoIncrement:true });
            adviserStore.createIndex("adviser_name",["adviser_fname","adviser_lname"],{
                unique:false
            })
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
        const adviserId =  await store.put({adviser_fname: adviserFname, adviser_lname: adviserLname});

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
    await store.put({resource_id:resId,adviser_id:adId})
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
        resource_id:resourceId
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
        book_isbn:isbn,
        resource_id:resourceId, 
        pub_id:pubId
    })
    await tx.done
}

const saveAuthorsOffline = async (resourceId, authors) => {
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
            const authorId =  await store.put({author_fname: fname, author_lname: lname});

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
};

const saveResourceAuthorOffline = async (resourceId,authorId)=>{
    const db = await initDB()
    const tx = db.transaction("resourceauthors", "readwrite");
    const store = tx.objectStore("resourceauthors");

    await store.put({resource_id: resourceId, author_id: authorId})
    await tx.done;
}

export const getCatalogOffline = async ()=>{
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
        const resourceAuthorId = resourceAuthorsList.filter(ra=>ra.resource_id==resource.resource_id).map(ra => ra.author_id);


        //get resource author
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
    return catalog

}


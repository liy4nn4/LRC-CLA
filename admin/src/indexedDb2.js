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

        // Create "adviser" store
        if (!db.objectStoreNames.contains("adviser")) {
            const adviserStore = db.createObjectStore("adviser", { keyPath: "adviser_id",autoIncrement:true });
            adviserStore.createIndex("adviser_name",["adviser_fname","adviser_lname"],{
                unique:false
            })
            adviserStore.createIndex("sync_status", "sync_status", { unique: false });
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
            deptStore.add({dept_name: "hospitality and restaurant management", dept_shelf_no: '4' });
            deptStore.add({dept_name: "references", dept_shelf_no: '5' });
            deptStore.add({dept_name: "student output", dept_shelf_no: '6' });
            deptStore.add({dept_name: "thesis and dissertation", dept_shelf_no: '7' });
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
            topicStore.add({topic_name: "food preparation and services", topic_row_no: '1' });
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

//delete synced data
export const deleteSyncedData = async (resourceId)=>{
    const db = await initDB();
    const tx = db.transaction('resources', "readwrite");
    const store = tx.objectStore('resources');

    await store.delete(resourceId);
    await tx.done;
}
/*----------------------SAVE RESOURCES-----------------*/
export const saveResourceOffline = async(data)=>{
    const mediaType = data.mediaType;
   
    const db = await initDB();
    const tx = db.transaction('resources','readwrite')
    const store = tx.objectStore('resources')
    await store.put(data)
    
    console.log('data',data)
   await tx.done
}
/*----------------------SAVE RESOURCES END-----------------*/

//displays resources in catalog page
export const getCatalogDetailsOffline = async (setCatalog)=>{
    const db = await initDB();
    //get resources
    const txRes = db.transaction('resources','readonly');
    const resStore = txRes.objectStore('resources')
    const resources = await resStore.getAll()
    await txRes.done
    console.log(resources)

    //get shelf no from department
    const txDept = db.transaction('department','readonly');
    const deptStore = txDept.objectStore('department')
    const  departments = await deptStore.getAll()
    await txDept.done
    console.log(departments)

    //store organized catalog
    const catalog = [];

    resources.map(resource=>{
        //get mediatype
        const type = resource.mediaType;
        let type_name;

        switch(type){
            case '1':
                type_name='book';
                break;
            case '2':
                type_name='journal';
                break;
            case '3':
                type_name='newsletter';
                break;
            case '4':
                type_name='thesis'
                break;
            default: 
                console.log('this type is not supported')
        }

        // get shelf no
        const shelfNo = departments.find(dept=>dept.dept_id == resource.department).dept_shelf_no

        const resourceDetails = {
            resource_id: resource.resource_id,
            resource_title: resource.title,
            type_name: type_name,
            author_names: resource.authors,
            dept_shelf_no: shelfNo,
            resource_quantity: resource.quantity

        }

        catalog.push(resourceDetails)
    })

    console.log(catalog)
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


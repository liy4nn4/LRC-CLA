import { initDB } from "./initializeIndexedDb";

// Get all data from a store
export const getAllFromStore = async (storeName) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return await store.getAll();
};

//displays resources in catalog page
export const getCatalogDetailsOffline = async (setCatalog)=>{
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

//get all unsynced data
// Get all unsynced data from a store
export const getAllUnsyncedFromStore = async (storeName) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index('sync_status')

    // Get all records where `sync_status` is `false`
    return await index.getAll(0);
};


export const getResourceAuthors = async (resourceId) => {
    const db = await initDB();

    // Get resourceauthors
    const raTx = db.transaction('resourceauthors', 'readonly');
    const raStore = raTx.objectStore('resourceauthors');
    const raIndex = raStore.index('resource_id');
    const resourceAuthors = await raIndex.getAll(resourceId);
    const authorIds = resourceAuthors.map((ra) => ra.author_id);

    // Get all authors
    const authorTx = db.transaction('author', 'readonly');
    const authorStore = authorTx.objectStore('author');
    let authors = [];

    for (const id of authorIds) {
        const author = await authorStore.get(id); // Fetch individual author
        if (author) {
            authors.push(author);
        }
    }

    await raTx.done; // Ensure resourceauthors transaction is complete
    await authorTx.done; // Ensure authors transaction is complete

    console.log("Author IDs:", authorIds);
    console.log("Authors:", authors);

    return authors;
};

export const getPub = async (resourceId) => {
    const db = await initDB();

    try {
        // Get book that matches resourceId
        const bookTx = db.transaction('book', 'readonly');
        const bookStore = bookTx.objectStore('book');
        const indexBook = bookStore.index('resource_id');
        const book = await indexBook.get(resourceId);
        const pubId = book ? book.pub_id : null; // Handle case where book might not exist
        await bookTx.done;

        if (!pubId) {
            console.error("Publisher ID not found for the given resource.");
            return null; // Handle error or return null
        }

        // Get publishers
        const pubTx = db.transaction('publisher', 'readonly');
        const pubStore = pubTx.objectStore('publisher');
        const indexPub = pubStore.index('pub_id');
        const publisher = await indexPub.get(pubId);
        await pubTx.done;

        console.log(publisher)

        return publisher;
    } catch (error) {
        console.error("Error fetching publisher or book:", error.message);
        return null;
    }
};

export const getBook = async (resourceId) => {
    const db = await initDB();

    try {
        // Get book that matches resourceId
        const bookTx = db.transaction('book', 'readonly');
        const bookStore = bookTx.objectStore('book');
        const indexBook = bookStore.index('resource_id');
        const book = await indexBook.get(resourceId);
        await bookTx.done;

        return book; // Return book if found
    } catch (error) {
        console.error("Error fetching book:", error.message);
        return null;
    }
};

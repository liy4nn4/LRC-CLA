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
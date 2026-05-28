const mongoose = require('mongoose');
const Project = require('./src/models/Project');
require('dotenv').config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Hard delete all projects that are marked as isDeleted: true
        const result = await Project.deleteMany({ isDeleted: true });
        console.log(`Successfully deleted ${result.deletedCount} soft-deleted projects.`);
        
        // OR: If the user just wants to clear EVERYTHING for that specific repo:
        // const result2 = await Project.deleteMany({ repoUrl: "https://github.com/siddhartha220507/visssh-webpage.git" });
        // console.log(`Deleted ${result2.deletedCount} instances of the specific repo.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();

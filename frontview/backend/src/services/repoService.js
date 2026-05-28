// services/repoService.js

const cache = require('../utils/cache');

// Ye function GitHub API se baat karke repos layega
const fetchUserRepos = async (accessToken) => {
    // Generate a unique cache key based on the token
    // Using a hash of the token would be better, but for now this works
    const cacheKey = `repos_${accessToken.slice(-10)}`;
    
    const cachedRepos = cache.get(cacheKey);
    if (cachedRepos) {
        console.log('⚡ Serving repos from cache');
        return cachedRepos;
    }

    try {
        // GitHub API call kar rahe hain (sort=updated se sabse naye upar aayenge)
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Token yahan bhejna zaroori hai
                'Accept': 'application/vnd.github.v3+json' // GitHub API version 3
            }
        });

        if (!response.ok) {
            // Agar GitHub error de (e.g., token expire ho gaya)
            const errBody = await response.json();
            throw new Error(`GitHub API Error: ${errBody.message || response.statusText}`);
        }

        const rawRepos = await response.json();

        // 4. Data ko clean aur transform karna (jaise tumne design mein likha tha)
        const repos = rawRepos.map(repo => ({
            id: repo.id,
            name: repo.name,
            owner: repo.owner.login,
            fullName: repo.full_name,
            url: repo.html_url,
            defaultBranch: repo.default_branch || 'main',
            language: repo.language,
            stars: repo.stargazers_count,
            description: repo.description,
            isPrivate: repo.private,
            lastUpdated: repo.updated_at
        }));

        cache.set(cacheKey, repos);
        return repos;

    } catch (error) {
        console.error("RepoService Error:", error.message);
        throw error; // Is error ko controller handle karega
    }
};

const deleteGithubRepo = async (accessToken, repoFullName) => {
    try {
        const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 204) {
            return true;
        }

        const errBody = await response.json().catch(() => ({}));
        throw new Error(`GitHub API Error: ${errBody.message || response.statusText}`);
    } catch (error) {
        console.error("RepoService Delete Error:", error.message);
        throw error;
    }
};

module.exports = {
    fetchUserRepos,
    deleteGithubRepo
};

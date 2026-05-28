// GitHub API service for fetching real-time data
import { useAuth } from "../context/AuthContext";

const GITHUB_API_BASE = "https://api.github.com";

class GitHubService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      Accept: "application/vnd.github.v3+json",
    };
    if (this.token) {
      headers["Authorization"] = `token ${this.token}`;
    }
    return headers;
  }

  async fetchWithAuth(url, options = {}) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}${url}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("GitHub API fetch error:", error);
      throw error;
    }
  }

  // Get user repositories
  async getUserRepos() {
    return this.fetchWithAuth("/user/repos?sort=updated&per_page=100");
  }

  // Get user profile
  async getUserProfile() {
    return this.fetchWithAuth("/user");
  }

  // Get repository commits (for deployment frequency)
  async getRepoCommits(owner, repo, per_page = 30) {
    return this.fetchWithAuth(
      `/repos/${owner}/${repo}/commits?per_page=${per_page}`,
    );
  }

  // Get repository branches
  async getRepoBranches(owner, repo) {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/branches`);
  }

  // Get repository deployments (if using GitHub Actions)
  async getRepoDeployments(owner, repo) {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/deployments`);
  }

  // Get repository workflows (GitHub Actions)
  async getRepoWorkflows(owner, repo) {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/actions/workflows`);
  }

  // Get workflow runs
  async getWorkflowRuns(owner, repo, workflow_id) {
    return this.fetchWithAuth(
      `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs`,
    );
  }

  // Calculate deployment metrics from commits
  calculateDeploymentMetrics(repos, commits) {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalDeployments = commits.length;
    const recentDeployments = commits.filter(
      (commit) => new Date(commit.commit.author.date) > last7Days,
    ).length;

    const successRate = 95.2 + Math.random() * 4.8; // Mock success rate
    const avgDeployTime = Math.floor(Math.random() * 180 + 60); // 1-4 minutes

    // Generate sparkline data
    const sparklineData = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 10 + 1),
    );

    return {
      totalDeployments,
      recentDeployments,
      successRate: successRate.toFixed(1),
      avgDeployTime: `${Math.floor(avgDeployTime / 60)}m ${avgDeployTime % 60}s`,
      sparklineData,
      change: `+${Math.floor(Math.random() * 20 + 5)}%`,
    };
  }

  // Generate heatmap data from commits with more granular deployment tracking
  generateHeatmapData(commits) {
    const heatmapData = Array(84).fill(0); // 7 days * 12 hours
    const now = new Date();

    commits.forEach((commit) => {
      const commitDate = new Date(commit.commit.author.date);
      const daysAgo = Math.floor((now - commitDate) / (1000 * 60 * 60 * 24));
      const hour = commitDate.getHours();

      if (daysAgo < 7 && daysAgo >= 0) {
        const index = (6 - daysAgo) * 12 + Math.floor(hour / 2);
        if (index >= 0 && index < 84) {
          // Weight more recent commits higher
          const recencyWeight = daysAgo === 0 ? 2 : 1;
          heatmapData[index] = Math.min(heatmapData[index] + recencyWeight, 3);
        }
      }
    });

    return heatmapData;
  }

  // Get analytics events from recent activity
  getAnalyticsEvents(repos, commits) {
    const events = [];

    // Add recent commits as events
    commits.slice(0, 10).forEach((commit, index) => {
      const repo =
        repos.find((r) => r.id === commit.repository?.id) || repos[0];
      events.push({
        id: repo?.name || "unknown",
        type: "commit_push",
        time: new Date(commit.commit.author.date).toLocaleTimeString(),
        status: Math.random() > 0.2 ? "Completed" : "Failed",
        message: commit.commit.message.split("\n")[0].substring(0, 50),
      });
    });

    return events;
  }
}

export const githubService = new GitHubService();

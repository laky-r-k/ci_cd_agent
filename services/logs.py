import requests
from github import Github ,Auth
from config import GITHUB_TOKEN


class git_log_fetcher:
    def __init__(self, repo_name, git_token):
        self.repo_name = repo_name
        self.git_token = git_token
        auth = Auth.Token(self.git_token)
        self.g = Github(auth=auth)
        self.repo = self.g.get_repo(self.repo_name)
        
    def fetch_workflow_runs(self,branch=None):
        if branch:
            return self.repo.get_workflow_runs(branch=branch)
        else:
            return self.repo.get_workflow_runs()
        

    def fetch_latest_workflow_logs(self,run_indx=0):
        runs = self.repo.get_workflow_runs()
        if runs.totalCount == 0:
            return "No workflow runs found."

        latest_run = runs[run_indx]
        print(f"Fetching logs for Workflow Run: {latest_run.name} (ID: {latest_run.id})")

        jobs = latest_run.jobs()
        headers = {
            "Authorization": f"Bearer {self.git_token}",
            "Accept": "application/vnd.github.v3+json"
        }

        logs_data = {}
        for job in jobs:
            log_url = f"https://api.github.com/repos/{self.repo_name}/actions/jobs/{job.id}/logs"
            response = requests.get(log_url, headers=headers)

            if response.status_code == 200:
                logs_data[job.name] = response.text
            else:
                logs_data[job.name] = f"Failed to fetch logs. Status Code: {response.status_code}"

        return logs_data
    
if __name__ == "__main__":
    TOKEN = GITHUB_TOKEN
    REPO_NAME = "laky-r-k/cd_test_repo"
    log_fetcher = git_log_fetcher(REPO_NAME, TOKEN)
    logs = log_fetcher.fetch_latest_workflow_logs()
    
    
    for job_name, log_content in logs.items():
        print(f"Logs for Job: {job_name}\n{log_content}\n{'-'*80}\n")   
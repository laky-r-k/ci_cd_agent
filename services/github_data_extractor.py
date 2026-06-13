from github import Github
from config import GITHUB_TOKEN
from github import Auth




# needs repo name , commit sha and git token
class commit_data_extractor:
    def __init__(self, repo_name, commit_sha, git_token):
        self.repo_name = repo_name
        self.commit_sha = commit_sha
        self.git_token = git_token
        auth = Auth.Token(self.git_token)
        self.g = Github(auth=auth)
        self.repo = self.g.get_repo(self.repo_name)
        self.commit = self.repo.get_commit(self.commit_sha)

    def extract_commit_data(self):
        commit_message = self.commit.commit.message
        modified_files = []
        for file in self.commit.files:
            modified_files.append({
                "filename": file.filename,
                "status": file.status,
                "additions": file.additions,
                "deletions": file.deletions,
                "patch": file.patch
            })
        return {
            "commit_message": commit_message,
            "modified_files": modified_files
        }

    
    
        

if __name__ == "__main__":
    
    repo_name = "laky-r-k/cd_test_repo"
    commit_sha = "2e4174607e4114c996482a3f1b451694cd525c22"
    git_token = GITHUB_TOKEN

    extractor = commit_data_extractor(repo_name, commit_sha, git_token)
    commit_data = extractor.extract_commit_data()
    print(commit_data)
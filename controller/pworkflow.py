#checks previous workflow run ...if the error previously occured its not new error 


from services.logs import git_log_fetcher
from config import GITHUB_TOKEN



def is_new_error():
    log_fetcher = git_log_fetcher(
    repo_name="laky-r-k/cd_test_repo",
    git_token= GITHUB_TOKEN
    )
    run = log_fetcher.fetch_workflow_runs()
    
    if run.totalCount==0:
        return  "pass"
    latest_run = run[0]
    if latest_run.conclusion == "success":
        return "pass"
    
    if run.totalCount >1:
        previous_run = run[1]
        print(f"Previous Commit Run ({previous_run.head_sha[:7]}): {previous_run.conclusion.upper()}")
        
        if previous_run.conclusion == "success":
            return "new"
        else :
            return "old"
    return "new"
    
    
